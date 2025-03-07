// Aqui eu defini a cena da tela inicial
class TelaInicial extends Phaser.Scene {
    constructor() {
        super({ key: 'TelaInicial' });
    }

    preload() {
        this.load.video('telainicial', './assets/telainicial.mp4');
        this.load.audio('tema', './assets/tema.mp3');
    }

    create() {
        // Ajustei a música do jeito que quero que toque durante o jogo
        this.tema = this.sound.add('tema', {
            loop: true,
            volume: 0.3
        });
        this.tema.play();

        // Essa parte exibe o vídeo da tela inicial
        let videoTelaInicial = this.add.video(window.innerWidth / 2, window.innerHeight / 2, 'telainicial');
        videoTelaInicial.setDisplaySize(window.innerWidth, window.innerHeight);
        videoTelaInicial.setLoop(true);
        videoTelaInicial.play(true);

        // Criando o botão "Jogar"
        let jogarButton = this.add.text(window.innerWidth / 2, window.innerHeight / 1.5, 'Jogar', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 20, y: 10 }
        }).setInteractive();

        jogarButton.setOrigin(0.5, 0.5);
        jogarButton.on('pointerdown', () => {
            this.transicaoParaJogo();
        });

        // Criando o botão "Como Jogar"
        let comoJogarButton = this.add.text(window.innerWidth / 2, window.innerHeight / 1.3, 'Como Jogar', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 20, y: 10 }
        }).setInteractive();

        comoJogarButton.setOrigin(0.5, 0.5);
        comoJogarButton.on('pointerdown', () => {
            this.transicaoParaComoJogar();
        });
    }

    // Função para criar a transição entre cenas
    transicaoParaJogo() {
        this.fadeTransicao('Game');
    }

    // Função de transição para a cena 'Como Jogar'
    transicaoParaComoJogar() {
        this.fadeTransicao('ComoJogar');
    }

    // Função de transição com fade para a próxima cena
    fadeTransicao(novaCena) {
        // Adicionar efeito de fade out (desaparecer)
        this.cameras.main.fadeOut(1000, 0, 0, 0);

        // Quando o fade out terminar, trocar de cena
        this.cameras.main.on('camerafadeoutcomplete', () => {
            this.scene.start(novaCena);
        });
    }
}

// Definir a cena de Como Jogar
class ComoJogar extends Phaser.Scene {
    constructor() {
        super({ key: 'ComoJogar' });
    }

    preload() {
        this.load.video('comojogar', './assets/comojogar.mp4');
        this.load.image('controles', './assets/controles.png');
    }

    create() {
        // Exibir o vídeo como fundo da tela
        let videoComoJogar = this.add.video(window.innerWidth / 2, window.innerHeight / 2, 'comojogar');
        videoComoJogar.setDisplaySize(window.innerWidth, window.innerHeight);
        videoComoJogar.setLoop(true);
        videoComoJogar.play(true);

        // Exibir a imagem de controles
        let controles = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'controles');
        controles.setScale(0.5);

        // Criando o botão "Voltar"
        let voltarButton = this.add.text(window.innerWidth / 2, window.innerHeight - 100, 'Voltar', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 20, y: 10 }
        }).setInteractive();

        voltarButton.setOrigin(0.5, 0.5);
        voltarButton.on('pointerdown', () => {
            this.transicaoParaTelaInicial();
        });
    }

    // Função de transição para a Tela Inicial
    transicaoParaTelaInicial() {
        this.fadeTransicao('TelaInicial');
    }

    fadeTransicao(novaCena) {
        this.cameras.main.fadeOut(1000, 0, 0, 0);

        this.cameras.main.on('camerafadeoutcomplete', () => {
            this.scene.start(novaCena);
        });
    }
}

// Definir a cena do jogo
class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
        this.velocidadeMeteoro = 200;
        this.velocidadeIncremento = 20;
    }

    preload() {
        this.load.video('fundo', './assets/fundojogo.mp4');
        this.load.image('player', './assets/nave.png');
        this.load.image('meteoro', './assets/meteoro.png');
        this.load.image('tiro', './assets/tiro.png');
        this.load.audio('somtiro', './assets/somtiro.mp3');
        this.load.audio('tema', './assets/tema.mp3');
    }

    create() {
        if (this.registry.get('pontuacao') === undefined) {
            this.registry.set('pontuacao', 0);
        }

        let videoFundo = this.add.video(window.innerWidth / 2, window.innerHeight / 2, 'fundo');
        videoFundo.setDisplaySize(window.innerWidth, window.innerHeight);
        videoFundo.setLoop(true);
        videoFundo.play(true);

        this.sound.play('tema', { loop: true, volume: 0.3 });

        this.nave = this.physics.add.sprite(300, this.cameras.main.height / 2, 'player');
        this.nave.setScale(0.7);
        this.nave.setDepth(1);
        this.nave.setAngle(90);
        this.nave.setCollideWorldBounds(true);

        this.teclado = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-R', this.atirar, this);

        this.meteoros = this.physics.add.group();
        this.tiros = this.physics.add.group();

        // A cada 3 segundos, aumenta a velocidade dos meteoros
        this.time.addEvent({
            delay: 3000,
            callback: () => {
                this.velocidadeMeteoro += this.velocidadeIncremento;
            },
            loop: true
        });

        // Criar meteoros continuamente
        this.time.addEvent({
            delay: 2000,
            callback: this.gerarMeteoro,
            callbackScope: this,
            loop: true
        });

        // Criar o placar
        this.placar = this.add.text(50, 50, 'Meteoros destruídos: ' + this.registry.get('pontuacao'), { fontSize: '30px', fill: '#FFF' });

        // Colisão da nave com meteoros
        this.physics.add.collider(this.nave, this.meteoros, this.transicaoParaGameOver, null, this);
        this.physics.add.collider(this.meteoros, this.nave, this.transicaoParaGameOver, null, this);
        this.physics.add.overlap(this.tiros, this.meteoros, this.destruirMeteoro, null, this);
    }

    update() {
        // Movimento da nave
        if (this.teclado.left.isDown) {
            this.nave.setVelocityX(-200);
        } else if (this.teclado.right.isDown) {
            this.nave.setVelocityX(200);
        } else {
            this.nave.setVelocityX(0);
        }

        if (this.teclado.up.isDown) {
            this.nave.setVelocityY(-200);
        } else if (this.teclado.down.isDown) {
            this.nave.setVelocityY(200);
        } else {
            this.nave.setVelocityY(0);
        }
    }

    // Função para gerar meteoros com a velocidade alterada
    gerarMeteoro() {
        let y = Phaser.Math.Between(50, this.cameras.main.height - 50);
        let meteoro = this.meteoros.create(this.cameras.main.width, y, 'meteoro');
        meteoro.setVelocityX(-this.velocidadeMeteoro);
        meteoro.setScale(0.6);
    }

    // Função para atirar
    atirar() {
        let tiro = this.tiros.create(this.nave.x + 40, this.nave.y, 'tiro');
        tiro.setVelocityX(300);
        tiro.setScale(0.5);

        
        this.sound.play('somtiro', { volume: 0.5, rate: 2.5 });
    }

    // Função para destruir meteoros
    destruirMeteoro(tiro, meteoro) {
        tiro.destroy();
        meteoro.destroy();

        let pontuacao = this.registry.get('pontuacao');
        pontuacao += 1;
        this.registry.set('pontuacao', pontuacao);
        this.placar.setText('Meteoros destruídos: ' + pontuacao);
    }

    // Função de transição para a cena Game Over
    transicaoParaGameOver() {
        this.fadeTransicao('GameOver');
    }

    fadeTransicao(novaCena) {
        this.cameras.main.fadeOut(1000, 0, 0, 0);

        this.cameras.main.on('camerafadeoutcomplete', () => {
            this.scene.start(novaCena);
        });
    }
}

// Definir a cena Game Over
class GameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOver' });
    }

    preload() {
        this.load.image('gameover', './assets/gameover.png');
    }

    create() {
        // Exibir a imagem de "Game Over"
        let gameOverImage = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'gameover');
        gameOverImage.setScale(0.88);

        // Criar botão "Voltar"
        let voltarButton = this.add.text(window.innerWidth / 2, window.innerHeight - 100, 'Voltar', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 20, y: 10 }
        }).setInteractive();

        voltarButton.setOrigin(0.5, 0.5);
        voltarButton.on('pointerdown', () => {
            this.transicaoParaTelaInicial();
        });
    }

    // Função de transição para a Tela Inicial
    transicaoParaTelaInicial() {
        this.fadeTransicao('TelaInicial');
    }

    // Função de transição com fade para a próxima cena
    fadeTransicao(novaCena) {
        // Adicionar efeito de fade out (desaparecer)
        this.cameras.main.fadeOut(1000, 0, 0, 0);

        // Quando o fade out terminar, trocar de cena
        this.cameras.main.on('camerafadeoutcomplete', () => {
            this.scene.start(novaCena);
        });
    }
}

// Configuração do jogo
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [TelaInicial, Game, ComoJogar, GameOver]
};

// Criar o jogo
const game = new Phaser.Game(config);
