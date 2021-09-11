const app = new PIXI.Application({ antialias: true })

app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.position = 'absolute';

document.body.appendChild(app.view)
document.querySelector("body > button").addEventListener('click', startApp)


function startApp(e) {
    let sound = new Howl({
        src: ['img/soundEx.wav']
    });

    if (e.returnValue) {
        document.querySelector("body > button").style.display = 'none'
        document.body.style.cursor = 'none'
    }

    const starTexture = PIXI.Texture.from('img/star.png');
    const fov = 20;
    const baseSpeed = 0.025;
    const starAmount = 1000;
    const starBaseSize = 0.08;
    const starStretch = 8;
    const stars = [];

    let cameraZ = 0;
    let speed = 25;
    let warpSpeed = 0.8;

    for (let i = 0; i < starAmount; i++) {
        const star = {
            sprite: new PIXI.Sprite(starTexture),
            z: 0,
            x: 0,
            y: 0,
        };

        star.sprite.anchor.x = 0.5;
        star.sprite.anchor.y = 0.7;

        randomizeStar(star, true);

        app.stage.addChild(star.sprite);
        stars.push(star);
    }

    function randomizeStar(star, initial) {
        const deg = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 1;

        star.z = initial ? Math.random() * 2000 : cameraZ + Math.random() * 1000 + 2000;
        star.x = Math.cos(deg) * distance;
        star.y = Math.sin(deg) * distance;
    }

    app.ticker.add((delta) => {
        speed += (warpSpeed - speed) / 20;
        cameraZ += delta * 10 * (speed + baseSpeed);

        for (let i = 0; i < starAmount; i++) {
            const star = stars[i];

            if (star.z < cameraZ) {
                randomizeStar(star);
            }

            const z = star.z - cameraZ;

            star.sprite.x = star.x * (fov / z) * app.renderer.screen.width + app.renderer.screen.width / 2;
            star.sprite.y = star.y * (fov / z) * app.renderer.screen.width + app.renderer.screen.height / 2;

            const dxCenter = star.sprite.x - app.renderer.screen.width / 2;
            const dyCenter = star.sprite.y - app.renderer.screen.height / 2;
            const distanceCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
            const distanceScale = Math.max(0, (2000 - z) / 2000);

            star.sprite.scale.x = distanceScale * starBaseSize;
            star.sprite.scale.y = distanceScale * starBaseSize + distanceScale * speed * starStretch * distanceCenter / app.renderer.screen.width;
            star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
        }
    });

    // Create Player Hearts
    const heartsLivesContainer = new PIXI.Container()
    const heartTexture = PIXI.Texture.from('img/heart.png')

    app.stage.addChild(heartsLivesContainer)

    for (let i = 0; i < 5; i++) {
        const heart = new PIXI.Sprite(heartTexture);

        heart.width = 30;
        heart.height = 30;
        heart.x = (i % 5) * 40;
        heart.y = Math.floor(i / 5) * 40;
        heartsLivesContainer.addChild(heart);
    }

    heartsLivesContainer.x = app.screen.width / 1.14;
    heartsLivesContainer.y = app.screen.height / 27;
    heartsLivesContainer.pivot.x = heartsLivesContainer.width / 2;
    heartsLivesContainer.pivot.y = heartsLivesContainer.height / 2;

    let text = new PIXI.Text('LIVES :', { fontFamily: 'Arial', fontSize: 24, fill: 0xff1010, align: 'left' });
    let lives = 5
    let bullets = [];
    let bulletSpeed;
    let enemyBulletsArr = [];
    let enemyBulletSpeed;

    text.x = heartsLivesContainer.x - 180
    text.y = heartsLivesContainer.y - 12

    app.stage.addChild(text)
    app.stage.interactive = true;

    document.body.addEventListener("pointerdown", fireBullet)

    // Create Player
    let player = new PIXI.Sprite.from("img/enemy.png")

    player.anchor.set(0.5)
    player.x = app.view.width / 2
    player.y = app.view.height / 2

    app.stage.addChild(player)
    app.stage.interactive = true;
    app.stage.on('pointermove', movePlayer)


    function movePlayer(e) {
        let pos = e.data.global
        player.x = pos.x;
        player.y = pos.y;
    }

    // Create Enemies
    const container = new PIXI.Container();
    const texture = PIXI.Texture.from('img/enemy.png');

    app.stage.addChild(container);

    for (let i = 0; i < 24; i++) {
        const enemy = new PIXI.Sprite(texture);

        enemy.width = 90
        enemy.height = 90
        enemy.anchor.set(0.5);
        enemy.x = (i % 12) * 100;
        enemy.y = Math.floor(i / 12) * 100;
        container.addChild(enemy);
    }

    container.x = app.screen.width / 1.9;
    container.y = app.screen.height / 4;
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;

    let enemiesArray = container.children

    app.ticker.add(enemyBulletLoop)

    function createEnemyBullet() {
        let randomEnemy = getRandomIntInclusive(0, enemiesArray.length - 1)
        let enemyBullet = new PIXI.Sprite.from('img/star.png')

        enemyBulletSpeed = 10;
        enemyBullet.anchor.set(1)

        if (enemiesArray.length > 0) {
            enemyBullet.x = enemiesArray[randomEnemy].x + 180
            enemyBullet.y = enemiesArray[randomEnemy].y + 180
        }

        enemyBullet.speed = enemyBulletSpeed;
        app.stage.addChild(enemyBullet)

        return enemyBullet
    }

    function enemyFire() {
        let bullet = createEnemyBullet();
        enemyBulletsArr.push(bullet);
    }

    let fireInterval = setInterval(enemyFire, 1500)

    function updateEnemyBullet() {
        for (let i = 0; i < enemyBulletsArr.length; i++) {
            enemyBulletsArr[i].position.y += enemyBulletsArr[i].speed;

            if (enemyBulletsArr[i].position.y > 1120) {
                enemyBulletsArr[i].dead = true;
            }

            if (enemyBulletsArr.length > 0) {
                if (intersectOfPlayerAndEnemy(enemyBulletsArr[i], player)) {
                    sound.play();
                    enemyBulletsArr[i].speed = 0;
                    heartsLivesContainer.children.length -= 1
                    lives -= 1
                }
                if (enemyBulletsArr[i].speed === 0) {
                    app.stage.removeChild(enemyBulletsArr[i])
                    enemyBulletsArr.splice(i, 1)
                    if (lives === 0) {
                        app.stage.removeChild(player)
                        app.ticker.stop()
                        document.body.style.cursor = 'default'
                    }
                }
            }
        }

        for (let i = 0; i < enemyBulletsArr.length; i++) {
            if (enemyBulletsArr[i].dead) {
                app.stage.removeChild(enemyBulletsArr[i])
                enemyBulletsArr.splice(i, 1)
            }
        }
    }

    function enemyBulletLoop() {
        updateEnemyBullet()
    }

    if (enemiesArray.length === 0) {
        clearInterval(fireInterval)
    }

    app.ticker.add(bulletLoop)

    function fireBullet() {
        let bullet = createBullet();

        bullets.push(bullet)
    }

    function createBullet() {
        let bullet = new PIXI.Sprite.from('img/star.png')

        bulletSpeed = 20;
        bullet.anchor.set(0.5)
        bullet.x = player.x;
        bullet.y = player.y;
        bullet.speed = bulletSpeed;
        app.stage.addChild(bullet);

        return bullet;
    }

    function updateBullets() {
        for (let i = 0; i < bullets.length; i++) {
            bullets[i].position.y -= bullets[i].speed;

            if (bullets[i].position.y < 0) {
                bullets[i].dead = true;
            }

            for (let j = 0; j <= enemiesArray.length - 1; j++) {
                if (bullets.length > 0) {
                    if (intersectOfPlayerAndEnemy(bullets[i], enemiesArray[j])) {
                        sound.play();
                        bullets[i].speed = 0;
                    }
                    if (bullets[i].speed === 0) {
                        container.removeChild(enemiesArray[j])
                        app.stage.removeChild(bullets[i])
                        bullets.splice(i, 1)
                    }
                }
            }
        }

        for (let i = 0; i < bullets.length; i++) {
            if (bullets[i].dead) {
                app.stage.removeChild(bullets[i])
                bullets.splice(i, 1)
            }
        }
    }

    function bulletLoop(delta) {
        updateBullets(delta)
    }

    function intersectOfPlayerAndEnemy(a, b) {
        let aBox = a.getBounds()
        let bBox = b.getBounds()

        return aBox.x + aBox.width > bBox.x &&
            aBox.x < bBox.x + bBox.width &&
            aBox.y + aBox.height > bBox.y &&
            aBox.y < bBox.y + bBox.height
    }

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
