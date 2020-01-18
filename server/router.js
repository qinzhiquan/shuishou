const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');

const router = express.Router();

const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'123456',
    port:3306,
    database:'test'
});//连接mysql数据库

let news_list = [];

router.all("*",function(req,res,next){
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin","*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers","content-type");
    //跨域允许的请求方式
    res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
    if (req.method.toLowerCase() == 'options')
        res.send(200);  //让options尝试请求快速结束
    else
        next();
});//设置跨域请求

router.post('/login',(req,res)=>{
   if(req.body.login_id == 'admin'){
        connection.query(`select name,password from admin where name=? and password=? limit 1`
            ,[req.body.login_name,req.body.login_password],(err,result)=>{
                if(err){
                    return res.send({
                        'err_code': 500,
                        'message':'服务器正忙，请稍后重试.'
                    });
                }
                if(result[0]){
                    let content = {name:req.body.login_name};// 要生成token的主题信息
                    let selectOrPrivateKey = 'shuishou';// 这是加密的key（密钥）
                    let token = jwt.sign(content,selectOrPrivateKey,{
                        expiresIn:60*60*1// 1小时过期
                    });

                    return res.send({
                        'login_id':'admin',
                        'err_code': 0,
                        'token':token,
                        'message':'登录成功.'
                    })
                }else{
                    return res.send({
                        'err_code': 1,
                        'message':'账号或密码错误.'
                    })
                }
            })//观众登录
    }else if(req.body.login_id=='judge'){
        connection.query(`select id,name,contest_number from judge where name =? and password=? limit 1`
            ,[req.body.login_name,req.body.login_password],(err,result)=>{
                if(err){
                    return res.send({
                        'err_code': 500,
                        'message':'服务器正忙，请稍后重试.'
                    });
                }
                if(result[0]){
                    let content = {name:req.body.login_name};// 要生成token的主题信息
                    let selectOrPrivateKey = 'shuishou';// 这是加密的key（密钥）
                    let token = jwt.sign(content,selectOrPrivateKey,{
                        expiresIn:60*60*1// 1小时过期
                    });

                    return res.send({
                        'login_id':'judge',
                        'err_code': 0,
                        'token':token,
                        'message':'登录成功.',
                        'contest_number':req.body.contest_number,
                        'judge_name':req.body.login_name,
                        'judge_id':result[0].id
                    })
                }else{
                    return res.send({
                        'err_code': 1,
                        'message':'账号或密码错误.'
                    })
                }
            })//观众登录
    }
});//登录请求

router.get('/menus',(req,res)=>{
   res.send([
       {
           'authName':'评委|参赛人员管理',
           children:[
               {
               'authName':'评委列表',
               'id':21,
               'path':'judge_list'
                },
               {
                   'authName':'参赛人员列表',
                   'id':22,
                   'path':'competitor_list'
               }
           ],
           'id':2,
           'path':'judge'
       },
       {
           'authName':'赛事管理',
           children:[{
               'authName':'赛事列表',
               'id':31,
               'path':'contest_list'
           }],
           'id':3,
           'path':''
       },
       {
           'authName':'数据管理',
           children:[{
               'authName':'数据统计',
               'id':41,
               'path':'information'
           }],
           'id':4,
           'path':''
       },
       {
           'authName':'工具箱',
           children:[{
               'authName':'工具箱',
               'id':51,
               'path':'toolbox'
           }],
           'id':5,
           'path':''
       }
   ])
});//获取菜单列表

router.get('/get_judge_list',(req,res)=>{
    if(req.query.query){
        let query = req.query.query;
        let query_sql = `select id,name,password,contest_number,create_time from judge where id REGEXP ? or name REGEXP ? or contest_number REGEXP ?`;
        connection.query(query_sql
            ,[query,query,query]
            ,(err,result)=>{
                if(err){
                    return res.send({
                        'err_code':500,
                        'message':'服务器忙，请联系管理员或稍后重试'
                    });
                }
                let total = result.length;
                let judge = result.slice(Number((req.query.pagenum-1)*req.query.pagesize),Number((req.query.pagenum-1)*req.query.pagesize)+Number(req.query.pagesize))
                return res.send({
                    'total':total,
                    'judge':judge,
                    'message':'查询成功'
                })
            })
    }else{
        connection.query(
            `select id,name,password,contest_number,create_time from judge`
            , (err,result)=>{
                if(err){
                    return res.send({
                        'err_code':500,
                        'message':'服务器忙，请联系管理员或稍后重试'
                    });
                }
                let total = result.length;
                let judge = result.slice(Number((req.query.pagenum-1)*req.query.pagesize),Number((req.query.pagenum-1)*req.query.pagesize)+Number(req.query.pagesize))
                return res.send({
                    'total':total,
                    'judge':judge,
                    'judge_list':result
                })
            })
    }
});//获取评委列表

router.post('/judge_register',(req,res)=>{
    let body = req.body.params;//保存请求体
    let date = new Date()//保存注册日期
    let nowDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + '-' + date.getHours() + ':' + date.getMinutes();
    connection.query('insert into judge(name,contest_number,comment,create_time) values(?,?,?,?)'
        ,[body.name,body.contest_number,body.comment,nowDate],(err,result)=>{
            if(err){
                return res.send({
                    'err_code':500,
                    'message':'服务器忙，请联系管理员或稍后重试'
                });
            }
            return res.send({
                'err_code':0,
                'message':'注册成功'
            })
        })
});//添加评委

router.get('/query_judge',(req,res)=>{
    connection.query(`select id,name,password,contest_number,comment from judge where id = ? limit 1`,
        [req.query.id],(err,result)=>{
            if(err){
                return res.send({
                    'err_code':500,
                    'message':'服务器忙，获取该评委失败，请联系管理员或稍后重试',
                });
            }
            if(result[0]){
                return res.send({
                    'err_code':1,
                    'message':'该评委id已注册',
                    'judge_info':result[0]
                })
            }else{
                return res.send({
                    'err_code':0,
                    'message':'该学号未注册'
                })
            }
        })//根据学号查找该学生是否注册过，返回查找结果
});//根据id查询评委已存在

router.post('/edit_judge',(req,res)=>{
    let editInfo = req.body.editForm;
    connection.query(`update judge set name = ?,contest_number = ?,password = ?,comment = ? where id = ?`
        ,[editInfo.name,editInfo.contest_number,editInfo.password,editInfo.comment,editInfo.id]
        ,(err,result)=>{
            if(err){
                return res.send({
                    'err_code':1,
                    'message':'修改信息失败'
                })
            }
            return res.send({
                'err_code':0,
                'message':'修改信息成功'
            })
        },)
});//根据id修改评委信息

router.post('/delete_judge',(req,res)=>{
    connection.query(`delete from judge where id = ?`
        ,[req.body.id]
        ,(err,result)=>{
            if(err){
                return res.send({
                    'err_code':500,
                    'message':'服务器忙，删除失败，请联系管理员或稍后重试',
                });
            }
            return res.send({
                'err_code':0,
                'message':'成功删除'
            })
        })
});//根据id删除评委

router.get('/get_contest_list',(req,res)=>{
    if(req.query.query){
        let query = req.query.query;
        let query_sql = `select id,contest_number,name,host,create_time from contest where contest_number REGEXP ? or name REGEXP ? or host REGEXP ?`;
        let p1 = new Promise((resolve, reject) => {
            connection.query(query_sql
                ,[query,query,query]
                ,(err,result)=>{
                    if(err){
                        reject()
                    }
                    if(result[0]){
                        resolve(result)
                    }else{
                        res.send();
                    }
                })
        })//获取contest表信息
        p1.then((result)=>{
            let p2 = new Promise((resolve, reject) =>{
                result.forEach((item,index,arr)=>{
                    connection.query(`select name from judge where contest_number = ?`
                        ,[item.contest_number]
                        ,(err,res)=>{
                            if(err){
                                reject(err)
                            }
                            result[index].judge = []
                            res.forEach((item)=>{

                                if(item.name){
                                    result[index].judge.push(item.name+',')
                                }
                            })

                            if(index>=arr.length-1){
                                resolve(result)
                            }
                        })
                })

            } )//获取评委name列表
            p2.then(result=>{
                let p3 = new Promise((resolve, reject) =>{
                    result.forEach((item,index,arr)=>{
                        connection.query(`select name from competitor where contest_number = ?`
                            ,[item.contest_number]
                            ,(err,res_2)=>{
                                if(err){
                                    return res.send({
                                        'err_code':500,
                                        'message':'服务器忙，删除失败，请联系管理员或稍后重试',
                                    });
                                }
                                result[index].competitor = []
                                res_2.forEach((item)=>{

                                    if(item.name){
                                        result[index].competitor.push(item.name+',')
                                    }
                                })

                                if(index>=arr.length-1){
                                    resolve(result)
                                }
                            })
                    })
                } )
                p3.then(result=>{
                    let contest = result.slice(Number((req.query.pagenum-1)*req.query.pagesize),Number((req.query.pagenum-1)*req.query.pagesize)+Number(req.query.pagesize))
                    return res.send({
                        'err_code':0,
                        'contest_list':contest,
                        'total':result.length
                    })
                })
            })
        }).catch((err)=>{
            return res.send({
                'err_code':500,
                'message':'服务器忙，删除失败，请联系管理员或稍后重试',
            });
        })
    }else{
        let p1 = new Promise((resolve, reject) => {
            connection.query(`select id,contest_number,name,host,create_time,anonymity from contest`
            ,[]
            ,(err,result)=>{
                if(err){
                    reject()
                }
                resolve(result)
                })
        })//获取contest表信息
        p1.then((result)=>{
            let p2 = new Promise((resolve, reject) =>{
                result.forEach((item,index,arr)=>{
                    connection.query(`select name from judge where contest_number = ?`
                        ,[item.contest_number]
                        ,(err,res)=>{
                            if(err){
                                reject(err)
                            }
                            result[index].judge = []
                            res.forEach((item)=>{

                                if(item.name){
                                    result[index].judge.push(item.name+',')
                                }
                            })

                            if(index>=arr.length-1){
                                resolve(result)
                            }
                        })
                })

            } )//获取评委name列表
            p2.then(result=>{
                let p3 = new Promise((resolve, reject) =>{
                    result.forEach((item,index,arr)=>{
                        connection.query(`select name from competitor where contest_number = ?`
                        ,[item.contest_number]
                        ,(err,res_2)=>{
                            if(err){
                                return res.send({
                                    'err_code':500,
                                    'message':'服务器忙，删除失败，请联系管理员或稍后重试',
                                });
                            }
                                result[index].competitor = []
                                res_2.forEach((item)=>{
                                    if(item.name){
                                        result[index].competitor.push(item.name+',')
                                    }
                                })

                            if(index>=arr.length-1){
                                resolve(result)
                            }
                            })
                    })
                } )
                p3.then(result=>{
                    let contest = result.slice(Number((req.query.pagenum-1)*req.query.pagesize),Number((req.query.pagenum-1)*req.query.pagesize)+Number(req.query.pagesize))
                    return res.send({
                        'err_code':0,
                        'contest_list':contest,
                        'total':result.length
                    })
                })
            })
        }).catch((err)=>{
            return res.send({
                'err_code':500,
                'message':'服务器忙，删除失败，请联系管理员或稍后重试',
            });
        })
    }


});//获取赛事列表

router.get('/get_contest_anonymity',(req,res)=>{
    connection.query(`select contest_number,name,anonymity from contest`
    ,[]
    ,(err,result)=>{
        if(err){
            res.send({
                'err_code':500,
                'message':'服务器错误，请联系管理员或稍后重试'
            })
        }
        res.send({
            'err_code':0,
            'contest':result
        })
        })
})

router.get('/query_contest_number',(req,res)=>{
    connection.query(`select contest_number,name,host,anonymity from contest where contest_number = ? limit 1`,
        [req.query.contest_number],(err,result)=>{
            if(err){
                return res.send({
                    'err_code':500,
                    'message':'服务器忙，查找比赛编号失败，请联系管理员或稍后重试',
                });
            }
            if(result[0]){
                return res.send({
                    'err_code':1,
                    'message':'该比赛编号已存在',
                    'contest':result
                })
            }else{
                return res.send({
                    'err_code':0,
                    'message':'该比赛未注册'
                })
            }
        })//根据学号查找该学生是否注册过，返回查找结果
});//查询该比赛是否已存在

router.post('/add_contest',(req,res)=>{
    let body = req.body.params;//保存请求体
    let date = new Date()//保存注册日期
    let nowDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + '-' + date.getHours() + ':' + date.getMinutes();
    connection.query('insert into contest(contest_number,name,host,create_time,anonymity) values(?,?,?,?,?)'
        ,[body.contest_number,body.name,body.host,nowDate,body.anonymity],(err,result)=>{
            if(err){
                return res.send({
                    'err':err,
                    'err_code':500,
                    'message':'服务器忙，请联系管理员或稍后重试'
                });
            }
            return res.send({
                'err_code':0,
                'message':'添加成功'
            })
        })
});//添加比赛

router.post('/edit_contest',(req,res)=>{
    let editInfo = req.body.editForm;
    connection.query(`update contest set name = ?,host = ? where contest_number = ?`
        ,[editInfo.name,editInfo.host,editInfo.contest_number]
        ,(err,result)=>{
            if(err){
                return res.send({
                    'err_code':1,
                    'message':'修改信息失败'
                })
            }
            return res.send({
                'err_code':0,
                'message':'修改信息成功'
            })
        },)
});//根据id修改比赛信息

router.post('/delete_contest',(req,res)=>{
    connection.query(`delete contest,grade,judge,competitor from contest contest inner join judge judge on contest.contest_number = judge.contest_number 
    inner join grade grade on contest.contest_number = grade.contest_number
    inner join competitor competitor on contest.contest_number = competitor.contest_number
    where contest.contest_number = ?`
        ,[req.body.contest_number]
        ,(err,result)=>{
            if(err){
                console.log(err)
                return res.send({
                    'err_code':500,
                    'message':'服务器忙，删除失败，请联系管理员或稍后重试',
                });
            }
            return res.send({
                'err_code':0,
                'message':'删除成功'
            })
        })
});//根据id删除比赛

router.get('/get_competitor_list',(req,res)=>{
    if(req.query.query){
        let query = req.query.query;
        let query_sql = `select id,name,contest_number,create_time,academy,class from competitor where id REGEXP ? or academy REGEXP ? or class REGEXP ? or name REGEXP ? or contest_number REGEXP ?`;
        connection.query(query_sql
            ,[query,query,query]
            ,(err,result)=>{
                if(err){
                    return res.send({
                        'err_code':500,
                        'message':'服务器忙，请联系管理员或稍后重试'
                    });
                }
                let total = result.length;
                let competitor = result.slice(Number((req.query.pagenum-1)*req.query.pagesize),Number((req.query.pagenum-1)*req.query.pagesize)+Number(req.query.pagesize))
                return res.send({
                    'total':total,
                    'competitor':competitor,
                    'message':'查询成功'
                })
            })
    }else{
        connection.query(
            `select id,name,contest_number,create_time,academy,class from competitor`
            , (err,result)=>{
                if(err){
                    return res.send({
                        'err_code':500,
                        'message':'服务器忙，请联系管理员或稍后重试'
                    });
                }
                let total = result.length;
                let competitor = result.slice(Number((req.query.pagenum-1)*req.query.pagesize),Number((req.query.pagenum-1)*req.query.pagesize)+Number(req.query.pagesize))
                return res.send({
                    'total':total,
                    'competitor_list':result,
                    'competitor':competitor
                })
            })
    }
});//获取参赛人员列表

router.post('/competitor_register',(req,res)=>{
    let body = req.body.params;//保存请求体
    let date = new Date()//保存注册日期
    let nowDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + '-' + date.getHours() + ':' + date.getMinutes();
    connection.query('insert into competitor(name,contest_number,create_time,academy,class) values(?,?,?,?,?)'
        ,[body.name,body.contest_number,nowDate,body.academy,body.class],(err,result)=>{
            if(err){
                return res.send({
                    'err':err,
                    'err_code':500,
                    'message':'服务器忙，请联系管理员或稍后重试'
                });
            }
            return res.send({
                'err_code':0,
                'message':'注册成功'
            })
        })
});//添加参赛人员

router.get('/query_competitor',(req,res)=>{
    connection.query(`select id,name,contest_number,academy,class from competitor where id = ? limit 1`,
        [req.query.id],(err,result)=>{
            if(err){
                return res.send({
                    'err_code':500,
                    'message':'服务器忙，获取该参赛人员失败，请联系管理员或稍后重试',
                });
            }
            if(result[0]){
                return res.send({
                    'err_code':1,
                    'message':'该参赛人员id已注册',
                    'competitor_info':result[0]
                })
            }else{
                return res.send({
                    'err_code':0,
                    'message':'该学号未注册'
                })
            }
        })//根据学号查找该学生是否注册过，返回查找结果
});//根据id查询参赛人员已存在

router.post('/edit_competitor',(req,res)=>{
    let editInfo = req.body.editForm;
    connection.query(`update competitor set name = ?,contest_number = ? where id = ?`
        ,[editInfo.name,editInfo.contest_number,editInfo.id]
        ,(err,result)=>{
            if(err){
                return res.send({
                    'err_code':1,
                    'message':'修改信息失败'
                })
            }
            return res.send({
                'err_code':0,
                'message':'修改信息成功'
            })
        },)
});//根据id修改参赛人员信息

router.post('/delete_competitor',(req,res)=>{
    connection.query(`delete from competitor where id = ?`
        ,[req.body.id]
        ,(err,result)=>{
            if(err){
                return res.send({
                    'err_code':500,
                    'message':'服务器忙，删除失败，请联系管理员或稍后重试',
                });
            }
            return res.send({
                'err_code':0,
                'message':'成功删除'
            })
        })
});//根据id删除参赛人员

router.get('/get_contest_info',(req,res)=>{
    connection.query(`select contest_number,name,host,anonymity from contest where contest_number = ? limit 1`
    ,[req.query.contest_number]
    ,(err,result)=>{
        if(err){
            return res.send({
                'err_code':500,
                'message':'服务器忙，获取信息失败，请联系管理员或稍后重试'
            });
        }
            if(result[0]){
                return res.send({
                    'err_code':0,
                    'message':'获取信息成功',
                    'result':result[0]
                });
            }else{
                return res.send({
                    'err_code':1,
                    'message':'未查找到相关比赛，可能管理员未创建该比赛'
                });
            }
        })
});//评委页面获取比赛信息

router.get('/get_competitor_info',(req,res)=>{
    connection.query(`select id,name,academy,class from competitor where contest_number = ?`
        ,[req.query.id]
        ,(err,result)=>{
            if(err){
                return res.send({
                    'err_code':500,
                    'message':'服务器忙，获取信息失败，请联系管理员或稍后重试'
                });
            }
            return res.send({
                'err_code':0,
                'message':'获取信息成功',
                'result':result
            });
        })
});//获取选手列表

router.post('/query_grade',(req,res)=>{
    connection.query(`select grade from grade where contest_number = ? and judge_id = ? and competitor_id = ?`
    ,[req.body.contest_number,req.body.judge_id,req.body.competitor_id]
            ,(err,result)=>{
        if(err){
            return res.send({
                'err_code':500,
                'message':'服务器忙，获取信息失败，请联系管理员或稍后重试'
            });
        }

        if(result[0]){
            return res.send({
                'err_code':1,
                'grade':result,
                'message':'您已给该选手打过分'
            });
        }else{
            return res.send({
                'err_code':0,
                'message':'您未给该选手打过分'
            });
        }
        })
});//查找是否打过分

router.post('/add_grade',(req,res)=>{
   let data = req.body.post_grade_data
   let insert_arr = [];
   let insert = [];
   let ope_grade = 0;
   data.grade.forEach((item,index)=>{
       ope_grade += item
       insert.push(data.contest_number,data.competitor_name,data.competitor_id,data.judge_name,data.judge_id,data.grade[index],data.content[index])
       insert_arr.push(insert)
       insert = []
   })
   let p1 = new Promise((resolve, reject) => {
       connection.query(`insert into ope_grade(grade,competitor_id,competitor_name,judge_name,judge_id,contest_number) values(?,?,?,?,?,?)`
           ,[ope_grade,data.competitor_id,data.competitor_name,data.judge_name,data.judge_id,data.contest_number],(err,result_2)=>{
               if(err){
                   return res.send({
                       'err_code':500,
                       'message':'服务器错误，评分失败，请稍后重试或联系管理员'
                   })
               }
            resolve();
           })
   })
    p1.then(()=>{
        connection.query(`insert into grade(contest_number,name,competitor_id,judge_name,judge_id,grade,contest_content) values?`
            ,[insert_arr]
            ,(err,result)=>{
                if(err){
                    return res.send({
                        'err_code':500,
                        'message':'服务器错误，评分失败，请稍后重试或联系管理员'
                    })
                }
                return res.send({
                    'err_code':0,
                    'message':'评分成功'
                })
            })
    })
});//评委打分

router.get('/get_rule',(req,res)=>{
    connection.query(`select contest_number,content,score,request from contest_rule where contest_number =?`
    ,[req.query.contest_number]
    ,(err,result)=>{
        if(err){
            return res.send({
                'err_code':500,
                'message':'服务器错误，请联系管理员或稍后重试'
            })
        }
            if(result[0]){
                return res.send({
                    'err_code':0,
                    'message':'获取比赛规则成功',
                    'rules':result
                })
            }else{
                connection.query(`select contest_number,content,score,request from contest_rule where contest_number =?`,
                    ['default']
                    ,(err,result)=>{
                        if(err){
                            return res.send({
                                'err_code':500,
                                'message':'服务器错误，请联系管理员或稍后重试'
                            })
                        }
                        res.send({
                            'err_code':0,
                            'message':'获取默认比赛规则成功',
                            'rules':result
                        })
                    })
            }
        })
});//获取比赛规则

router.post('/add_rule',(req,res)=>{
    let contest_number = req.body.contest_number;
    let rule = req.body.rule;
    connection.query(`delete from contest_rule where contest_number =?`
    ,[contest_number]
    ,(err,result)=>{
        if(err) {
            return res.send({
                'err_code': 500,
                'message': '服务器错误，请联系管理员或稍后重试'
            })
        }
            let p1 = new Promise((resolve, reject) =>{
                rule.forEach((item,index)=>{
                    connection.query(`insert into contest_rule(contest_number,content,score,request) values(?,?,?,?)`
                        ,[contest_number,item.content,item.score,item.request]
                        ,(err,result_2)=>{
                            if(err){
                                return res.send({
                                    'err_code':500,
                                    'message':'服务器错误，请联系管理员或稍后重试'
                                })
                            }
                        })
                    if(index>=rule.length-1){
                        resolve()
                    }
                })
            } )
           p1.then(()=>{
               return res.send({
                   'err_code':0,
                   'message':'修改成功'
               })
           })
        })
});//更改比赛规则

router.get('/get_contest_rule',(req,res)=>{
    connection.query(`select content,score,request from contest_rule where contest_number = ?`
    ,[req.query.contest_number]
    ,(err,result)=>{
        if(err){
            return res.send({
                'err_code':500,
                'message':'服务器正忙，请联系管理员或稍后重试'
            })
        }
        if(result[0]){
            return res.send({
                'err_code':0,
                'rules':result
            })
        }
        })
});//获取比赛规则

router.get('/get_grade_list',(req,res)=>{
    if(req.query.query){
        let query = req.query.query;
        let query_sql = `select id,contest_number,name,competitor_id,judge_name,judge_id,grade,contest_content from grade where contest_number REGEXP ? or judge_id REGEXP ? or name REGEXP ? or judge_name REGEXP ? or competitor_id REGEXP ? or contest_content REGEXP ?`;
        connection.query(query_sql
            ,[query,query,query,query,query,query]
            ,(err,result) => {
                if(err){
                    return res.send({
                        'err_code':500,
                        'message':'服务器忙，请联系管理员或稍后重试'
                    });
                }
                let total = result.length;
                let grade = result.slice(Number((req.query.pagenum-1)*req.query.pagesize),Number((req.query.pagenum-1)*req.query.pagesize)+Number(req.query.pagesize))
                return res.send({
                    'total':total,
                    'grade':grade,
                    'message':'查询成功'
                })
            })
    }else{
        connection.query(
            `select id,contest_number,name,competitor_id,judge_id,judge_name,grade,contest_content from grade`
            , (err,result)=>{
                if(err){
                    return res.send({
                        'err_code':500,
                        'message':'服务器忙，请联系管理员或稍后重试'
                    });
                }
                let total = result.length;
                let grade = result.slice(Number((req.query.pagenum-1)*req.query.pagesize),Number((req.query.pagenum-1)*req.query.pagesize)+Number(req.query.pagesize))
                return res.send({
                    'total':total,
                    'grade':grade,
                    'grade_list':result,
                    'message':'查询成功'
                })
            })
    }
});//获取成绩列表

router.get('/get_ope_grade_list',(req,res)=>{
    if(req.query.query){
        let query = req.query.query;
        let query_sql = `select id,grade,competitor_id,competitor_name,judge_id,judge_name,contest_number from ope_grade where contest_number REGEXP ? or judge_id REGEXP ? or judge_name REGEXP ? or competitor_name REGEXP ? or competitor_id REGEXP ?`;
        connection.query(query_sql
            ,[query,query,query,query,query]
            ,(err,result) => {
                if(err){
                    return res.send({
                        'err_code':500,
                        'message':'服务器忙，请联系管理员或稍后重试'
                    });
                }
                let total = result.length;
                let grade = result.slice(Number((req.query.pagenum-1)*req.query.pagesize),Number((req.query.pagenum-1)*req.query.pagesize)+Number(req.query.pagesize))
                return res.send({
                    'total':total,
                    'grade':grade,
                    'message':'查询成功'
                })
            })
    }else{
        connection.query(
            `select id,grade,competitor_id,competitor_name,judge_id,judge_name,contest_number from ope_grade`
            , (err,result)=>{
                if(err){
                    return res.send({
                        'err_code':500,
                        'message':'服务器忙，请联系管理员或稍后重试'
                    });
                }
                let total = result.length;
                let grade = result.slice(Number((req.query.pagenum-1)*req.query.pagesize),Number((req.query.pagenum-1)*req.query.pagesize)+Number(req.query.pagesize))
                return res.send({
                    'total':total,
                    'grade':grade,
                    'message':'查询成功'
                })
            })
    }
});//获取ope成绩列表

router.post('/post_news',(req,res)=>{
    let contest_number = req.body.contest_number;
    news_list.unshift({'contest_number':contest_number,'news':req.body.news})
    res.send({
        'err_code':0,
        'message':'发送成功'
    })
})//发送消息

router.get('/get_news_list',(req,res)=>{
    let contest_news_list  = [];
    let contest_number = req.query.contest_number;
    news_list.forEach((item,index)=>{
        if(item.contest_number == contest_number){
            contest_news_list.push(item.news);
        }
    })
    res.send({
        'err_code':0,
        'news_list':contest_news_list
    })
});//获取消息列表

router.get('/get_all_news',(req,res)=>{
    res.send({
        'err_code':0,
        'news_list':news_list
    })
})

router.get('/get_judge_excel',(req,res)=>{
    connection.query(`select id,name,contest_number,create_time,comment from judge where contest_number = ?`
        ,[req.query.contest_number]
        ,(err,result)=>{
            if(err){
                console.log(err)
                return res.send({
                    'err_code':500,
                    'message':'服务器忙，获取成绩失败，请联系管理员或稍后重试'
                });
            }
            res.send({
                'err_code':0,
                'message':'获取成绩成功',
                'judge':result
            })
        })
})//获取评委列表

router.get('/get_competitor_excel',(req,res)=>{
    connection.query(`select id,name,contest_number,create_time,academy,class from competitor where contest_number = ?`
        ,[req.query.contest_number]
        ,(err,result)=>{
            if(err){
                console.log(err)
                return res.send({
                    'err_code':500,
                    'message':'服务器忙，获取成绩失败，请联系管理员或稍后重试'
                });
            }
            res.send({
                'err_code':0,
                'message':'获取成绩成功',
                'competitor':result
            })
        })
})//获取选手列表

router.get('/get_grade_excel',(req,res)=>{
    connection.query(`select id,name,contest_number,competitor_id,judge_id,judge_name,grade,contest_content from grade where contest_number = ?`
        ,[req.query.contest_number]
        ,(err,result)=>{
            if(err){
                console.log(err)
                return res.send({
                    'err_code':500,
                    'message':'服务器忙，获取成绩失败，请联系管理员或稍后重试'
                });
            }
            res.send({
                'err_code':0,
                'message':'获取成绩成功',
                'grade':result
            })
        })
})//获取成绩列表

router.get('/get_grade_ranking',(req,res)=>{
    connection.query(`select id,grade,competitor_id,competitor_name,judge_id,judge_name,contest_number from ope_grade where contest_number = ?`
    ,[req.query.contest_number]
    ,(err,result)=>{
        if(err){
            console.log(err)
            return res.send({
                'err_code':500,
                'message':'服务器忙，获取成绩失败，请联系管理员或稍后重试'
            });
        }
        res.send({
            'err_code':0,
            'message':'获取成绩成功',
            'grade':result
        })
        })
})//获取名次排名

router.post('/post_suggest',(req,res)=>{
    connection.query(`insert into suggest(name,phone,suggest) values(?,?,?)`
    ,[req.body.feedback_form.name,req.body.feedback_form.phone,req.body.feedback_form.suggest]
    ,(err,result)=>{
        if(err){
            return res.send({
                'err_code':500,
                'message':'服务器错误，请联系管理员或稍后重试'
            })
        }
            return res.send({
                'err_code':0,
                'message':'提交成功'
            })
    }
    )
})

module.exports = router;