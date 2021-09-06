const app = new PIXI.Application({ antialias: true })
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.position = 'absolute'

document.body.appendChild(app.view)

setTimeout(startApp, 2000)

function startApp()  {

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

        enemyBulletSpeed = 20;
        let randomEnemy = getRandomIntInclusive(0, enemiesArray.length - 1)

        let enemyBullet = new PIXI.Sprite.from('img/star.png')
        enemyBullet.anchor.set(1)
        enemyBullet.x = enemiesArray[randomEnemy].x + 180
        enemyBullet.y = enemiesArray[randomEnemy].y + 180
        enemyBullet.speed = enemyBulletSpeed;
        app.stage.addChild(enemyBullet)

        return enemyBullet
    }


    function enemyFire() {
        let bullet = createEnemyBullet();
        enemyBulletsArr.push(bullet);
    }
    setInterval(enemyFire, 800)


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