import { FRUITS } from "./fruits.js";

// 모듈 불러오기
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    World = Matter.World,
    // 조작을 위해 Body 선언
    Body = Matter.Body,
    Events = Matter.Events;
// 엔진 선언
const engine = Engine.create();

// 렌더 선언(배경)
const render = Render.create({
    engine,
    element: document.body,
    options: {
        wireframes: false,  // true 배경색이 적용이 안됩니다.
        background: '#F7F4C8',
        width: 620,
        height: 850,
    }
});

// 벽 배치를 위한 world 선언
const world = engine.world;

// 왼쪽 벽 생성
const leftWall = Bodies.rectangle(15, 395, 30, 790, {
    isStatic: true, // 고정해 주는 기능
    render: { fillStyle: '#E6B143'} // 색상 지정
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
    isStatic: true,
    render: { fillStyle: '#E6B143'}
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
    isStatic: true,
    render: { fillStyle: '#E6B143'}
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
    isStatic : true,
    isSensor : true,    // 충돌은 감지하는데, 물리엔진은 적용 안함
    render: { fillStyle: '#E6B143'}
});

// 벽 월드에 배치
World.add(world, [leftWall, rightWall, ground, topLine]);


Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;

function addFruit() {

    // 과일 인덱스값 저장
    const index = Math.floor(Math.random() * 5);

    // 과일 이미지 경로 불러오기 변수
    const fruit = FRUITS[index];

    const body = Bodies.circle(300, 50, fruit.radius, {
        index : index,
        isSleeping : true,  // 시작시 바로 떨어지지 않고 잠시 멈춤
        render : {
            sprite : { texture : `${fruit.name}.png`},
        },

        // 통통 튀기는 설정
        restitution : 0.5,
    })

    currentBody = body;
    currentFruit = fruit;

    World.add(world, body)
}

// 키보드 입력 함수
window.onkeydown = (event) => {

    if(disableAction)
        return;

    switch(event.code) {
        case "KeyA":
            if(currentBody.position.x - currentFruit.radius > 30){
                Body.setPosition(currentBody, {
                    x: currentBody.position.x - 10,
                    y: currentBody.position.y,
                });
                break;
            }
            
        case "KeyD":
            if(currentBody.position.x - currentFruit.radius < 560){
                Body.setPosition(currentBody, {
                    x: currentBody.position.x + 10,
                    y: currentBody.position.y,
                });
            }
            
            break;
        case "KeyS":
            // isSleeping을 false로 해서 과일을 떨어트림
            currentBody.isSleeping = false;
            // 1초 대기 후 새로운 과일 생성
            disableAction = true;
            setTimeout(() => {
                addFruit();
                disableAction = false;
            },1000)
            break;

    }
}

Events.on(engine,"collisionStart",(event)=>{
    event.pairs.forEach((collision)=>{
        if(collision.bodyA.index == collision.bodyB.index){
            const index = collision.bodyA.index;
            World.remove(world,[collision.bodyA,collision.bodyB])
            const newFruit = FRUITS[index+1]
            const newBody = Bodies.circle(
                collision.collision.supports[0].x,
                collision.collision.supports[0].y ,
                newFruit.radius,
                {
                    index : index +1,
                    render : {sprite : { texture : `${newFruit.name}.png`}}
                }
            )

            World.add(world,newBody )
        }
    })
})

addFruit();