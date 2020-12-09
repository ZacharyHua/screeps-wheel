/**
 * @version 1.0.3
 *   随机优化 加入路径缓存
 * 第一版本  使用这个逻辑的时候，需要向 Memory 中 初始化一些参数 .
 * 使用前需要将以下参数序列化到memory中 建议逐条使用
 * 
 * Memory.reomteSource = {};
 * 
 *  // scoopObserverPowerBankRoom 定义你需要 observer 采集 powerbank 的房间 建议 5个 过道房
 * Memory.reomteSource.scoopPowerBank = [];
 * Memory.reomteSource.scoopObserverPowerBankRoomLength = 0;
 * Memory.reomteSource.scoopObserverPowerBankRoom = scoopObserverPowerBankRoom;
 * 
 * 
 * // scoopObserverDepositRoom 定义你需要 observer 采集 deposit 的房间 建议 5个 过道房
 * Memory.reomteSource.scoopDeposit = [];
 * Memory.reomteSource.scoopObserverDepositRoomLength = 0;
 * Memory.reomteSource.scoopObserverDepositRoom = scoopObserverDepositRoom;
 * 
 * 如果一个房间 同时挖 powerbank 和 deposit 需要将 observerPowerBankTask(room) 、 observerDepositTask(room) 两个方法进行合并 ，
 *   同时 需要指定 observer 查看的房  , 即 memory 中的  scoopObserverPowerBankRoom 或  scoopObserverDepositRoom ，也可以指定一个 窥探房间list 的名字存入 memory 中
 * 
 * 
 * 引入方式： main.js 中 添加 var remoteSource = require('remoteSource.js') 
 *  loop 方法中执行 ： remoteSource.run(); 即可
 *  
 * 下一步优化方案 
 *      缺点： 在采集 power 的时候 距离采集房间不同距离分房间中 生成 carry 的时间是固定的，理论上来说，生成 carry 的时间会随着房间距离的增加而推移。
 *      优化方向： ---> 350k 墙体厚度为基础 ，每隔一个房间 提前 .....
 *      优化方向： 增加路径缓存、建筑缓存
 *      //  todo 使用 id 进行标记 
 * 
 */


/**
 * 远程对象 目前只有采集对象 没有自动攻击对象
 */
var remoteSource = {
    run: function() {
        const checkStatus = Game.time % checkLookSourceCreepticks;
        if(checkStatus == 0){
            checkScoopPbTask();
            checkScoopDepsitTask();
        }
        observerPowerBankTask('E59N29');
        observerDepositTask('E48N19');
        executeScoopTask();
    }
};

module.exports = remoteSource;

/**
 * 定义 observer powerBank 的房间
 */
const scoopObserverPowerBankRoom =[
    'E49N30','E50N30','E50N31','E51N30','E52N30','E53N30','E54N30','E55N30','E56N30','E57N30','E58N30','E59N30',
    'E60N30','E59N20','E60N19','E60N20','E60N21','E60N22','E60N23','E60N24','E60N25','E60N26','E60N27','E60N28',
    'E60N29','E60N31','E60N32','E60N33','E60N34','E60N35','E60N36','E60N37','E60N38','E60N39',
]

/**
 * 定义 observer deposit 的房间
 */
const scoopObserverDepositRoom = [
    'E44N20','E45N20','E46N20','E47N20','E48N20','E49N20','E50N20',
    'E50N15','E50N16','E50N17','E50N18','E50N19','E50N21','E50N22',
]

/**
 * 每隔多长时间检查一次 资源是否存在
 */
const checkLookSourceCreepticks = 1;

/**
 * 定义 寻找到 pb 资源的 
 */
const scoopPowerSwan = [
    
]

/**
 * 定义 寻找到 pb 资源的 
 */
const scoopDeposit = [
    
]

/**
 * 获取当前没有生成 creep 的 spwan
 * @param {房间名称} roomName 
 */
function getRoomSpwanName(roomName){
    var list = [];
    var spwan = '';
    for(const i in Game.spawns) {
        
        if(Game.spawns[i].spawning == null && Game.spawns[i].pos.roomName == roomName){
            list.push(i);
        }
        if(Game.spawns[i].pos.roomName == roomName){
            spwan = i;
        }
    }
    if(list.length == 0){
        return spwan;
    }
    return list[0];
}

/**
 * 自杀
 * @param {creep} creep 
 */
function suicide(creep){
    creep.suicide();
}

/**
 * 检测挖掘pb的任务
 */
function checkScoopPbTask(){
   const scoopPowerBankList = Memory.reomteSource.scoopPowerBank;
   for(var i in scoopPowerBankList){
        isTaskCreepExist(scoopPowerBankList[i]);
   }
}

/**
 * 检测挖掘deposit的任务
 */
function checkScoopDepsitTask(){
    const scoopPowerBankList = Memory.reomteSource.scoopDeposit;
    for(var i in scoopPowerBankList){
        isDepositTaskCreepExist(scoopPowerBankList[i]);
    }
}

/**
 * 判断对应的creep是否存在
 * @param {任务} task 
 */
function isTaskCreepExist(task){
    var attacks = (_.filter(Game.creeps, (creep) => creep.memory.role == 'attack' && creep.memory.target == 'pb' && creep.memory.room == task.room));
    if(attacks.length == 0){
        generateAttackPbCreep(task);
    // }else if(attacks[0].ticksToLive < 250 && attacks.length == 1 && task.ticksToDecay > 3500){
    //     generateAttackPbCreep(task);
    // }else if(attacks.length == 1 && task.ticksToDecay < 4500 && task.flag){
    //     generateAttackPbCreep(task);
    }
    var heals = _.filter(Game.creeps, (creep) => creep.memory.role == 'heal' && creep.memory.target == 'pb' && creep.memory.room == task.room)
    if( heals.length == 0){
        generateHealCreep(task);
    // }else if(heals[0].ticksToLive < 250 && heals.length == 1 && task.ticksToDecay > 3500){
    //     generateHealCreep(task);
    // }else if(heals.length == 1 && task.ticksToDecay < 4500 && task.flag){
    //     generateHealCreep(task);
    }
}

/**
 * 判断对应的creep是否存在
 * @param {*} task 
 */
function isDepositTaskCreepExist(task){
    var harvets = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvest' && creep.memory.target == 'deposit' && creep.memory.room == task.room);
    if(harvets.length == 0){
        generateHarvestCreep(task);
    }
    // else if(harvets[0].ticksToLive < 200 && harvets.length == 1){
    //     generateHarvestCreep(task);
    // }

    var carrys = _.filter(Game.creeps, (creep) => creep.memory.role == 'carry' && creep.memory.target == 'deposit' && creep.memory.room == task.room);
    if(carrys.length == 0){
        generateCarryDepositCreep(task);
    }
    // else if(carrys[0].ticksToLive < 200 && carrys.length == 1){
    //     generateCarryDepositCreep(task);
    // }else if(task.lastCooldown < 15 && carrys.length == 1){
    //     generateCarryDepositCreep(task);
    // }
    // todo  需要优化     
}

/**
 * 执行挖pb的命令
 */
function executeScoopTask(){
    var attackList = _.filter(Game.creeps, (creep) => creep.memory.role == 'attack' && creep.memory.target == 'pb');
    var healkList = _.filter(Game.creeps, (creep) => creep.memory.role == 'heal' && creep.memory.target == 'pb');
    var carryPbList = _.filter(Game.creeps, (creep) => creep.memory.role == 'carry' && creep.memory.target == 'pb');
    var harvestList = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvest' && creep.memory.target == 'deposit');
    var carryDepositList = _.filter(Game.creeps, (creep) => creep.memory.role == 'carry' && creep.memory.target == 'deposit');
    moveToPbHome(attackList,'attack');
    moveToPbHome(healkList,'heal');
    moveToPbHome(carryPbList,'carryPowerBank');
    moveToPbHome(harvestList,'harvest');
    moveToPbHome(carryDepositList,'carryDeposit');
}

/**
 * 向目标房间移动
 * @param {creepList} creepList 
 */
function moveToPbHome(creepList,type){
    for(var i in creepList){
        const remoteRoome = creepList[i].name.substring(0,6);
        if(type == 'carryPowerBank'){
            pickupPowerBank(creepList[i]);
        }else if(type == 'carryDeposit'){
            carryDeposit(creepList[i]);
        }else{
            if(creepList[i].room.visual.roomName != remoteRoome && creepList[i].ticksToLive > 300 && ( type != 'carryDeposits')){
                creepList[i].moveTo(new RoomPosition( 25, 25, remoteRoome), { reusePath: 350 })
            }else{
                if(type == 'attack'){
                    attackPowerBank(creepList[i]);
                }else if(type == 'heal'){
                    healHurtCreep(creepList[i]);
                }else if(type == 'harvest'){
                    harvestDeposit(creepList[i]);
                }
            }
        }  
    }
}

/**
 * 采集 deposit
 * @param {creep} creep 
 */
function harvestDeposit(creep){
    var target = getDepositByMemory(creep.memory.id);
    if(creep.store.getFreeCapacity() > 10 ) {
        if(target){
            creep.moveTo(target.x, target.y, { reusePath: 50 });
        }else{
            if(creep.room.visual.roomName == creep.name.substring(0,6)){
                deleteTask1(creep.name.substring(0,6));
            }
        }   
    }else{
        var roomCreeps = creep.room.find(FIND_MY_CREEPS);
        var creeps =  _.filter(Game.creeps, (x) => x.memory.role == 'carry' && x.memory.target == 'deposit' && x.memory.room ==  creep.room.visual.roomName && x.memory.id == creep.memory.id);
        if(creeps.length >0 && roomCreeps.length > 0){
            if(creeps[0].store.getFreeCapacity() > 0){
                if(creep.transfer(creeps[0], target[0].depositType) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creeps[0], { reusePath: 50 });
                }
            }
        }
    }
}

/**
 * 搬运 deposit
 * @param {*} creep 
 */
function carryDeposit(creep){
    const remoteRoome = creep.name.substring(0,6);
    if(creep.room.visual.roomName != remoteRoome ){
        var status = false;
        for(var i in Memory.reomteSource.scoopDeposit){
            if(Memory.reomteSource.scoopDeposit[i].room == remoteRoome){
                status = true;
            }   
        }
        if(status){
            creep.moveTo(new RoomPosition( 25, 25, remoteRoome),{ reusePath: 350 })
        }
    }else if(creep.store.getFreeCapacity() > 0 && creep.ticksToLive > 300){
        const target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
        if(target) {
            if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }else{
            var targets = getDepositByMemory(creep.memory.id);
            if(targets){
                creep.moveTo(targets.x + 2 , targets.y + 2 ,{ reusePath: 50 } )
            }
        }
    }else{
        if(creep.store.getUsedCapacity() == 0){
            suicide(creep);
        }
        if (creep.room.visual.roomName != creep.name.substring(7,13)) {
            creep.moveTo(new RoomPosition( 25, 25, creep.name.substring(7,13),{ reusePath: 350 }))
        }else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TERMINAL
                    );
                }
            });
            if(targets.length > 0){
                creep.moveTo(targets[0],{ reusePath: 50 });
                for(const resourceType in creep.carry) {
                    creep.transfer(targets[0], resourceType);
                }
            }
        }
    }  
}

/**
 * 攻击powerbank
 * @param {creep} creep 
 */
function attackPowerBank(creep){
    var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_POWER_BANK);
        }
    });
    // todo 更新 更新 这个房间中 powerbank 的信息
    if(targets.length >0){
        judgeSourceMessage(targets[0]);
        if(creep.attack(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], {reusePath: 50});
        }
    }else{
        // 采集 pb 任务完成  删除 缓存中的任务
        deleteTask(creep.room.visual.roomName);
        suicide(creep);
    }  
}
/**
 * 治疗受伤的creep
 * @param {creep} creep 
 */
function healHurtCreep(creep){
    const target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
        filter: function(object) {
            return object.hitsMax > object.hits ;
        }
    });
    if(target) {
        if(creep.heal(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }else{
        // 没有受伤对象就向 powerbank 移动
        const powerBank = getPowerbankByMemory(creep.name.substring(0,6));
        if(powerBank){
            creep.moveTo(powerBank.x+1,powerBank.y+1, {reusePath: 50});
        }else{
            suicide(creep);
        } 
    }
}
/**
 * 去采集资源 并带回
 * @param {采集资源的creep} creep 
 */
function pickupPowerBank(creep){
    if(creep.store.getUsedCapacity(RESOURCE_POWER) == 0) {
        const remoteRoome = creep.name.substring(0,6);
        if(creep.room.visual.roomName != remoteRoome ){
            var status = false;
            for(var i in Memory.reomteSource.scoopPowerBank){
                if(Memory.reomteSource.scoopPowerBank[i].room == remoteRoome){
                    status = true;
                }   
            }
            if(status){
                creep.moveTo(new RoomPosition( 25, 25, remoteRoome), {reusePath: 350})
            }else{
                suicide(creep);
            }
        }else{
            const target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
            if(target) {
                if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }else{
                const powerBank = getPowerbankByMemory(remoteRoome);
                if(powerBank){
                    creep.moveTo(powerBank.x + 3 ,powerBank.y + 3, {reusePath: 50})
                }
            }
        }
     }else{
        if (creep.room.visual.roomName != creep.name.substring(7,13)) {
            creep.moveTo(new RoomPosition(15,37, creep.name.substring(7,13)), {reusePath: 350})
        }else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE
                    );
                }
            });
            if(targets.length > 0){
                if(creep.transfer(targets[0], RESOURCE_POWER) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff',reusePath: 50}});
                }
            }
        }
     }
}


/**
 * 从缓存中获取 power bank
 * @param {*} room 
 */
 function getPowerbankByMemory(room){
    var source = {};
    const scoopPowerBankList = Memory.reomteSource.scoopPowerBank;
    for(var i in scoopPowerBankList){
        if(room == scoopPowerBankList[i].room){
            source = scoopPowerBankList[i];
        }
    }
    return source;
 }

/**
 * 从缓存中获取 deposit 对象
 * @param {*} room 
 */
function getDepositByMemory(id){
    var source = {};
    const scoopDepositList = Memory.reomteSource.scoopDeposit;
    for(var i in scoopDepositList){
        if(id == scoopDepositList[i].id){
            source = scoopDepositList[i];
        }
    }
    return source;
 }


/**
 * 判断当前房间 powerbank 还有多少 hixs 
 * @param {资源} target 
 */
function judgeSourceMessage(target){
    if(target.hits < 460000){
        const scoopPowerBankList =  Memory.reomteSource.scoopPowerBank;
        for(var i in scoopPowerBankList){
            if(target.room.name == scoopPowerBankList[i].room)
            generateCarryCreep(scoopPowerBankList[i]);
        }
    }
}


/**
 * 删除即将过期的任务
 * @param {资源} target 
 */
function deleteTask(room){
    const scoopPowerBankList =  Memory.reomteSource.scoopPowerBank;
    for(var i in scoopPowerBankList){
        if(room == scoopPowerBankList[i].room){
            Memory.reomteSource.scoopPowerBank.splice(i,1);
        }      
    }
}

/**
 * 删除即将过期的任务
 * @param {资源} target 
 */
function deleteTask1(room){
    var scoopDepositList =  Memory.reomteSource.scoopDeposit;
    for(var i in scoopDepositList){
        if(room == scoopDepositList[i].room){
            Memory.reomteSource.scoopDeposit.splice(i,1);
        }      
    }
}

/**
 * oberver 巡视房间
 * @param {观察者房间} room 
 */
function observerPowerBankTask(room){
    var observer = Game.rooms[room].find(FIND_STRUCTURES, {
        filter: (i) => i.structureType == STRUCTURE_OBSERVER 
    })[0];
    var scoopObserverPowerBankRoomLength = Memory.reomteSource.scoopObserverPowerBankRoomLength;
    Memory.reomteSource.scoopObserverPowerBankRoomLength = (scoopObserverPowerBankRoomLength + 1) % Memory.reomteSource.scoopObserverPowerBankRoom.length;
    if (observer.observeRoom(Memory.reomteSource.scoopObserverPowerBankRoom[Memory.reomteSource.scoopObserverPowerBankRoomLength]) != OK) {
        console.log(' ob失败??  当前ob房间：' + Memory.reomteSource.scoopObserverPowerBankRoom[Memory.reomteSource.scoopObserverPowerBankRoomLength])
    }
    // ob 完成
    const theRoomName = Memory.reomteSource.scoopObserverPowerBankRoom[scoopObserverPowerBankRoomLength];
    const theRoom = Game.rooms[theRoomName];
    if(!theRoom){
        return console.log(Memory.reomteSource.scoopObserverPowerBankRoom[scoopObserverPowerBankRoomLength] + ' 观察失败')
    }
    var powerBanks = theRoom.find(FIND_STRUCTURES, {
        filter: (structure) => { return structure.structureType == STRUCTURE_POWER_BANK; }
    });
    if(powerBanks.length > 0 ){
        var target = powerBanks[0];
        if(Game.map.getRoomLinearDistance(room,target.room.name) < 8){
            if( target.power > 2500 && !isPbSourceExist(target,Memory.reomteSource.scoopPowerBank)){
                const source = {};
                source.id = target.id;
                source.room = target.room.name;
                source.generateRoom = room;
                source.ticksToDecay = target.ticksToDecay;
                source.power = target.power;
                source.hits = target.hits;
                source.flag = true;
                source.x = target.pos.x;
                source.y = target.pos.y;
                Memory.reomteSource.scoopPowerBank.push(source)
            }if(isPbSourceExist(target,Memory.reomteSource.scoopPowerBank)){
                var scoopPowerBankList = Memory.reomteSource.scoopPowerBank;
                for(var i in scoopPowerBankList){
                    if(target.room.name == scoopPowerBankList[i].room){
                        scoopPowerBankList[i].ticksToDecay = target.ticksToDecay;
                        scoopPowerBankList[i].hits = target.hits;
                        if(target.ticksToDecay < 3500){
                            scoopPowerBankList[i].flag = false;
                        }
                        Memory.reomteSource.scoopPowerBank[i] = scoopPowerBankList[i];
                    }
                }
            }
        }
    }
}

/**
 * 
 * @param {观察者房间} room 
 */
function observerDepositTask(room){
    var observer = Game.rooms[room].find(FIND_STRUCTURES, {
        filter: (i) => i.structureType == STRUCTURE_OBSERVER 
    })[0];
    var scoopObserverDepositRoomLength = Memory.reomteSource.scoopObserverDepositRoomLength;
    Memory.reomteSource.scoopObserverDepositRoomLength = (scoopObserverDepositRoomLength + 1) % Memory.reomteSource.scoopObserverDepositRoom.length;
    if (observer.observeRoom(Memory.reomteSource.scoopObserverDepositRoom[Memory.reomteSource.scoopObserverDepositRoomLength]) != OK) {
        console.log(roomName + ' ob失败??  当前ob房间：' + Memory.reomteSource.scoopObserverDepositRoom[Memory.reomteSource.scoopObserverDepositRoomLength])
    }
    // ob 完成
    const theRoomName = Memory.reomteSource.scoopObserverDepositRoom[scoopObserverDepositRoomLength];
    const theRoom = Game.rooms[theRoomName];
    if(!theRoom){
        return console.log(Memory.reomteSource.scoopObserverDepositRoom[scoopObserverDepositRoomLength] + '  观察失败')
    }
    var deposits = theRoom.find(FIND_DEPOSITS);
    if(deposits.length > 0){
        for(var i in deposits){
            var target = deposits[i];
            var scoopDepositList = Memory.reomteSource.scoopDeposit;
            if(!isDepositSourceExist(target,scoopDepositList) && target.lastCooldown < 100){
                const source = {};
                source.id = target.id;
                source.room = target.room.name;
                source.generateRoom = room;
                source.ticksToDecay = target.ticksToDecay;
                source.lastCooldown = target.lastCooldown;
                source.flag = true;
                source.x = target.pos.x;
                source.y = target.pos.y;
                Memory.reomteSource.scoopDeposit.push(source)
            }else{
                for(var j in scoopDepositList){
                    if(target.id == scoopDepositList[j].id){
                        scoopDepositList[j].ticksToDecay = target.ticksToDecay;
                        scoopDepositList[j].lastCooldown = target.lastCooldown;
                        Memory.reomteSource.scoopDeposit[i] = scoopDepositList[j];
                    }
                }
            }   
        }        
    }
}

/**
 * 判断资源是否存在
 * @param {资源} target 
 * @param {资源列表} sourceList 
 */
function isPbSourceExist(target,sourceList){
    var status = false;
    for(var i in sourceList){
        if(sourceList[i].room == target.room.name){
            status = true;
        }   
    }
    return status;
 }

 /**
 * 判断资源是否存在
 * @param {资源} target 
 * @param {资源列表} sourceList 
 */
function isDepositSourceExist(target,sourceList){
    var status = false;
    for(var i in sourceList){
        if(sourceList[i].room == target.room.name){
            status = true;
        }
    }
    return status;
 }


/**
 * 生成攻击工具pb建筑的creep
 * @param {任务} task 
 */
function generateAttackPbCreep(task){
    const name = task.room + ' ' + task.generateRoom + ' ' + 'attack' + ' ' + Game.time
    Game.spawns[getRoomSpwanName(task.generateRoom)].spawnCreep([
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
        ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
        ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE
    ], name, 
        {memory: {role: 'attack', target: 'pb', worker: true, room: task.room}}); 
}

/**
 * 生成治疗 creep
 * @param {任务} task 
 */
function generateHealCreep(task){
    const name = task.room + ' ' + task.generateRoom +' ' + 'heal' + ' ' + Game.time
    Game.spawns[getRoomSpwanName(task.generateRoom)].spawnCreep([
        HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,
        HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,
        HEAL,HEAL,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
       
    ], name, 
        {memory: {role: 'heal', target: 'pb', worker: true, room: task.room}});
}

/**
 * 根据资源房间的情况生成对应的creep
 * @param {任务} task 
 */
function generateCarryCreep(task){
    var carryNumber = Math.ceil((task.power - 100) / 1500)
    var carrys = _.filter(Game.creeps, (creep) => creep.memory.role == 'carry' && creep.memory.target == 'pb' && creep.memory.room == task.room)
    if(carrys.length < carryNumber){
        const name = task.room + ' ' + task.generateRoom +' ' + 'carry' + ' ' + Game.time;
        Game.spawns[getRoomSpwanName(task.generateRoom)].spawnCreep([
            CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
            CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
            CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
            MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
            MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
        ], name, 
            {memory: {role: 'carry', target: 'pb', worker: true, room: task.room}});
    }
}

/**
 * 生成采矿 creep
 * @param {任务} task 
 */
function generateHarvestCreep(task){
    const name = task.room + ' ' + task.generateRoom +' ' + 'harvest' + ' ' + Game.time;
    Game.spawns[getRoomSpwanName(task.generateRoom)].spawnCreep([
        WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
        WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
        WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ], name, 
        {memory: {role: 'harvest', target: 'deposit', worker: true, room: task.room,id:task.id}});
}

/**
 * 生成搬运 creep
 * @param {任务} task 
 */
function generateCarryDepositCreep(task){
    const name = task.room + ' ' + task.generateRoom +' ' + 'carry' + ' ' + Game.time;
    Game.spawns[getRoomSpwanName(task.generateRoom)].spawnCreep([
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
    ], name, 
        {memory: {role: 'carry', target: 'deposit', worker: true, room: task.room,id:task.id}});
}