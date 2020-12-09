/**
 * @version 1.0.0
 * 援建代码
 * 第一个版本：
 *  1. 生成 build 进行建筑 援建 ps ： 检测到 相应房间中存在未完成的建筑
 *  2. 向援建房间搬运能量（路程遥远不推荐开启） --> 需要 由某个状态 控制是否开启搬运能量
 *  3. 生成 update 角色 ，去相应房间中 升级 控制器 --> 前期需要 6 级之后不需要
 *  4. 生成 harvest 角色 ---> 挖矿 （五级之后关闭这个角色）
 *  
 * 使用方式； 
 *      1. 6级之前 需要在source、controller 旁边各修建一个 container
 *      2. 需要将id序列化到 memory 中？
 * 
 * 
 * 
 */


var remoteSupper = {
    run: function() {
        checkRemoteSupperTask();
    }
};

module.exports = remoteSupper;


remoteSupperList = [
    {
        room: '******',
        build: {
            number: 2,
            flag:true
        },
        update: {
            number: 2,
            flag:true
        },
        harvest: {
            number: 2,
            flag:true
        },
        transfer: {
            number: 2,
            flag:true
        }
    },{
        room: '******',
        build: {
            number: 2,
            flag:true
        },
        update: {
            number: 2,
            flag:true
        },
        harvest: {
            number: 2,
            flag:true
        },
        transfer: {
            number: 2,
            flag:true
        }
    }
]

/**
 * 检测是否存在需要 援建的任务
 */
 function checkRemoteSupperTask(){
    const remoteSupperList = Memory.remoteSupper;
    for(var i in remoteSupperList){
         isTaskCreepExist(remoteSupperList[i]);
    }
 }

/**
 * 判断援建的creep是否存在
 * @param {援建对象} remoteSupper 
 */
 function isTaskCreepExist(remoteSupper){
    if((_.filter(Game.creeps, (creep) => creep.memory.role == 'build' && creep.memory.target == 'supper' && creep.memory.room == remoteSupper.room )) < remoteSupper.build.number){
        generateBuilderSupperCreep(room);
    }
    if((_.filter(Game.creeps, (creep) => creep.memory.role == 'update' && creep.memory.target == 'supper' && creep.memory.room == remoteSupper.room )) < remoteSupper.update.number){
        generateUpdateSupperCreep(room);
    }
    if((_.filter(Game.creeps, (creep) => creep.memory.role == 'harvest' && creep.memory.target == 'supper' && creep.memory.room == remoteSupper.room )) < remoteSupper.harvest.number){
        generateHavrvestSupperCreep(room);
    }
    if((_.filter(Game.creeps, (creep) => creep.memory.role == 'transfer' && creep.memory.target == 'supper' && creep.memory.room == remoteSupper.room )) < remoteSupper.transfer.number){
        generateTransferSupperCreep(room);
    }
 }
 
