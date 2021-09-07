const app = new PIXI.Application({ antialias: true })
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.position = 'absolute';
document.body.appendChild(app.view)
document.querySelector("body > button").addEventListener('click', startApp)


function startApp(e) {
    if (e.returnValue) {
        document.querySelector("body > button").style.display = 'none'
        document.body.style.cursor = 'none'
    }
    // Moving Star Background

    const starTexture = PIXI.Texture.from('img/star.png');

    const starAmount = 1000;
    let cameraZ = 0;
    const fov = 20;
    const baseSpeed = 0.025;
    let speed = 25;
    let warpSpeed = 0.8;
    const starStretch = 8;
    const starBaseSize = 0.08;

    const stars = [];
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
        star.z = initial ? Math.random() * 2000 : cameraZ + Math.random() * 1000 + 2000;

        const deg = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 1;
        star.x = Math.cos(deg) * distance;
        star.y = Math.sin(deg) * distance;
    }

    app.ticker.add((delta) => {

        speed += (warpSpeed - speed) / 20;
        cameraZ += delta * 10 * (speed + baseSpeed);
        for (let i = 0; i < starAmount; i++) {
            const star = stars[i];
            if (star.z < cameraZ) randomizeStar(star);

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
    // 
    let bullets = [];
    let bulletSpeed;

    let enemyBulletsArr = [];
    let enemyBulletSpeed;

    app.stage.interactive = true;
    document.body.addEventListener("pointerdown", fireBullet)

    //Create and moving Player
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



    //Create Enemies
    //Create container for enemies
    const container = new PIXI.Container();
    app.stage.addChild(container);
    // Create a new texture
    const texture = PIXI.Texture.from('img/enemy.png');
    // Create grid of enemies
    for (let i = 0; i < 24; i++) {
        const enemy = new PIXI.Sprite(texture);

        enemy.anchor.set(0.5);
        enemy.x = (i % 12) * 100;
        enemy.y = Math.floor(i / 12) * 100;
        container.addChild(enemy);
    }

    let enemiesArray = container.children

    //Enemy Bullets action
    app.ticker.add(enemyBulletLoop)

    function createEnemyBullet() {

        enemyBulletSpeed = 10;
        let randomEnemy = getRandomIntInclusive(0, enemiesArray.length - 1)

        let enemyBullet = new PIXI.Sprite.from('img/star.png')
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



    function updateEnemyBullet(delta) {
        for (let i = 0; i < enemyBulletsArr.length; i++) {
            enemyBulletsArr[i].position.y += enemyBulletsArr[i].speed;
            if (enemyBulletsArr[i].position.y > 1120) {
                enemyBulletsArr[i].dead = true;
            }

            if (enemyBulletsArr.length > 0) {
                if (intersectOfPlayerAndEnemy(enemyBulletsArr[i], player)) {
                    enemyBulletsArr[i].speed = 0;
                }
                if (enemyBulletsArr[i].speed === 0) {
                    app.stage.removeChild(player)
                    app.stage.removeChild(enemyBulletsArr[i])
                    enemyBulletsArr.splice(i, 1)
                    app.ticker.stop()
                    document.body.style.cursor = 'default'
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

    function enemyBulletLoop(delta) {
        updateEnemyBullet()
    }
    if (enemiesArray.length === 0) {
        clearInterval(fireInterval)
    }



    // Move container to the center
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 5;
    // Center enemy sprite in local container coordinates
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;


    // Create and animate bullets

    app.ticker.add(bulletLoop)


    function fireBullet(e) {
        let bullet = createBullet();
        bullets.push(bullet)
    }
    function createBullet() {
        bulletSpeed = 20;
        let bullet = new PIXI.Sprite.from('img/star.png')
        bullet.anchor.set(0.5)
        bullet.x = player.x;
        bullet.y = player.y;
        bullet.speed = bulletSpeed;
        app.stage.addChild(bullet);

        return bullet;
    }
    function updateBullets(delta) {

        for (let i = 0; i < bullets.length; i++) {
            bullets[i].position.y -= bullets[i].speed;
            if (bullets[i].position.y < 0) {
                bullets[i].dead = true;
            }

            for (let j = 0; j <= enemiesArray.length - 1; j++) {
                if (bullets.length > 0) {
                    if (intersectOfPlayerAndEnemy(bullets[i], enemiesArray[j])) {
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
    // Intersec function
    function intersectOfPlayerAndEnemy(a, b) {
        let aBox = a.getBounds()
        let bBox = b.getBounds()

        return aBox.x + aBox.width > bBox.x &&
            aBox.x < bBox.x + bBox.width &&
            aBox.y + aBox.height > bBox.y &&
            aBox.y < bBox.y + bBox.height
    }

    // Getting random enemy number function 
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
    }
}