import { do_Times, Vector2D, weightedRandom, shuffleArray } from '../../utils';

const stairTypes = [
	"normal",
	"slideLeft",
	"slideRight",
	"blade",
	"jump",
	"fade"
];

const charTypes = [1, 2];

const easyStairs = stairTypes.slice(0, 2);

const gameWidth = 800;
const gameHeight = 600;
const updateFPS = 30;

class Game {
	constructor(args){
		this.io = args.io;
		this.id = args.roomID;
		this.player1 = args.player1;
		this.player2 = args.player2;
		this.time = 0;
		this.timeOut;
	}
	init = () => {
		const { io, id } = this;	
		io.in(id).emit('BATTLE_ROOM_ID', {
			roomID: id
		});
		const initStairConfigs = this.initialStairs();
		const initPlayerConfigs = this.initialPlayers();
		io.in(id).emit('GAME_INIT_DATA', {
			roomID: id,
			initStairConfigs: initStairConfigs,
			initPlayerConfigs: initPlayerConfigs
		});
		setTimeout(() => {
			this.start();
		}, 5000);
	}
	start = () => {
		const { io, id } = this;
		io.in(id).emit('GAME_START');
		this.timeOut = setInterval(this.update , 1000 / updateFPS);
	}
	update = () => {
		this.time++;
		this.createNewStair();
	}
	unmount = () => {
		clearTimeout(this.timeOut);
	}
	initialStairs = () => {
		let stairConfigs = [];
		const stairInterval = 150; // 階梯間隔
		do_Times(5)(i => {
			stairConfigs.push(
				{
					position: new Vector2D(
						Math.random() * (gameWidth - 150) + 75, // 讓階梯集中中央
						i * stairInterval + 100 // 階梯高度依據index分佈
					),
					type: easyStairs[parseInt(Math.random() * easyStairs.length)]
				}
			);
		});
		return stairConfigs;
	}
	createNewStair = () => {
		const { io, id, time } = this;
		const floor = parseInt(time / 100);

		// 每隔25毫秒，新增一個階梯
		if (time % 30 === 0) {
			let appearWeights; // 權重
			if (floor <= 10) {
				appearWeights = [25, 15, 15, 20, 20, 5];
			}
			if (floor > 10) {
				appearWeights = [20, 15, 15, 20, 20, 10];
			}
			if (floor > 20) {
				appearWeights = [15, 15, 15, 20, 20, 15];
			}
			if (floor > 40) {
				appearWeights = [10, 15, 15, 20, 20, 20];
			}
			if (floor > 60) {
				appearWeights = [10, 10, 10, 20, 25, 25];
			}

			const newStair = {
				position: new Vector2D(
					Math.random() * (gameWidth - 150) + 75,
					gameHeight
				), // 讓階梯集中中央
				type: weightedRandom(stairTypes, appearWeights),
			};

			io.in(id).emit('NEW_STAIR_CONFIG', {
				newStairConfig: newStair
			});
		}
	}
	initialPlayers = () => {
		const shuffledMaster = shuffleArray([this.player1, this.player2]);

		const initPlayerConfigs = [
			{
				playerID: 1,
				master: shuffledMaster[0],
				position: new Vector2D(gameWidth * 0.33333, 200)
			},
			{
				playerID: 2,
				master: shuffledMaster[1],
				position: new Vector2D(gameWidth * 0.66666, 200)
			}
		];

		return initPlayerConfigs;
	}
};

export default Game;