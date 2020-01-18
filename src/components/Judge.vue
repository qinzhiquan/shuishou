<template>
    <div>
<!--        顶部-->
        <el-header>
            <div>
                <img style="height: 50px;border-radius: 50%" src='../assets/shuishou.png'>
                <span>水手评分系统</span>
            </div>
            <div>
                <el-button @click="drawer = true" type="primary" style="margin-left: 16px;border-radius: 50%">
                    工
                </el-button>
                <el-drawer
                        style="color: black"
                        title="工具箱"
                        direction="rtl"
                        :visible.sync="drawer"
                        :with-header="false">
                    <p style="font-size: 10px">
                        <span>当前时间:</span>
                        {{now_date}}</p>
                    <hr/>
                    <el-card>
                        <el-button size="mini">定时器：</el-button><br/>
                        <el-button size="mini" @click="start_timer">{{now_time}}</el-button>
                        <el-button size="mini" @click="reset_timer">重置</el-button>
                        <el-button size="mini" @click="save_timer">保存</el-button>
                        <el-button size="mini" @click="time_arr=[]">清空</el-button>
                    </el-card>
                    <el-card v-if="time_arr[0]">
                        <el-tag v-for="(item,index) in time_arr" :key="index" size="mini">{{item}}</el-tag>
                    </el-card>
                </el-drawer>
            </div>
            <el-button type="info" @click="logout" size="mini">退出登录</el-button>
        </el-header>
        <h5>欢迎您，{{judge_name}},本次比赛为{{anonymity}}评分。</h5>
        <p style="color: #4dc71f" v-if="news_list[0]">
            <span>管理员：{{news_list[0]}}</span>
            <el-button style="margin-left: 20px" type="primary" size="mini" @click="news_list_DialogVisible=true">全部消息</el-button>
        </p>
<!--        折叠面板-->
<!--        比赛信息-->
        <el-collapse>
            <el-collapse-item title="比赛信息" name="1">
                <el-row>
                    <el-button>比赛编号:</el-button>
                    <el-input v-model="contestInfo.contest_number" disabled></el-input>
                </el-row>
                <el-row>
                    <el-button>比赛名称:</el-button>
                    <el-input v-model="contestInfo.name" disabled></el-input>
                </el-row>
                <el-row>
                    <el-button>主办方|地点:</el-button>
                    <el-input v-model="contestInfo.host" disabled></el-input>
                </el-row>
            </el-collapse-item>
        </el-collapse>

<!--        评分规则-->
        <el-collapse>
            <el-collapse-item title="评分规则" name="1">
                <el-table :data="contest_rule" border stripe style="margin-right:20px ">
                    <el-table-column label="#" type="index" width="20px"></el-table-column>
                    <el-table-column label="内容" prop="content" width="50px"></el-table-column>
                    <el-table-column label="分数" prop="score" width="50px"></el-table-column>
                    <el-table-column label="要求" prop="request"></el-table-column>
                </el-table>
            </el-collapse-item>
        </el-collapse>

<!--            选手列表-->
        <el-collapse>
            <el-collapse-item title="选手信息" name="1">
<!--                选手表格-->
                <template>
                <el-table :data="competitor" border stripe>
                    <el-table-column prop="id" label="编号" width="40px"></el-table-column>
                    <el-table-column prop="name" label="姓名"></el-table-column>
                    <el-table-column prop="academy" label="学院"></el-table-column>
                    <el-table-column prop="class" label="班级"></el-table-column>
                    <el-table-column label="打分">
                        <template slot-scope="scope">
                            <el-button type="primary" size = mini @click="edit_grade(scope.row.id,scope.row.name)">打分</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                </template>
            </el-collapse-item>
        </el-collapse>

        <!--    评委打分对话框-->
        <el-dialog
                width="90%"
                title="打分"
                :visible.sync="post_grade_DialogVisible"
                append-to-body
                @close="clear_post_grade_arr">
            <el-button type="primary" size="mini" style="margin-bottom: 20px" @click="grade_rule_DialogVisible=true">查看评分细则</el-button>
            <p v-if="post_grade_arr[0]">您之前打的分数是：{{post_grade_arr}}</p>
            <el-form ref="post_grade_form_ref" required :model="post_grade" label-width="80px">
                <el-form-item v-for="(item,index) in contest_rule" :key="item.content" :label="item.content">
                    <el-input type="number" :disabled="is_grade" placeholder="请根据评分规则评分" v-model.number="post_grade[index]"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="post_grade_DialogVisible=false">取消</el-button>
                <el-button type="primary" @click="submit_post_grade" :disabled="is_grade">确定</el-button>
            </div>
        </el-dialog>

<!--        评分细则对话框-->
        <el-dialog
                width="95%"
                title="打分"
                :visible.sync="grade_rule_DialogVisible"
                append-to-body>
            <el-table :data="contest_rule" border stripe style="margin-right:20px ">
                <el-table-column label="#" type="index" width="20px"></el-table-column>
                <el-table-column label="内容" prop="content" width="40px"></el-table-column>
                <el-table-column label="分数" prop="score" width="40px"></el-table-column>
                <el-table-column label="要求" prop="request"></el-table-column>
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="grade_rule_DialogVisible=false">确定</el-button>
            </div>
        </el-dialog>

        <!--        管理员全部消息对话框-->
        <el-dialog
                width="95%"
                title="历史消息记录"
                :visible.sync="news_list_DialogVisible"
                append-to-body>
            <p v-if="news_list[0]">
                <el-tag v-for="(item,index) in news_list" :key="index" size="mini">{{item}}</el-tag>
            </p>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="news_list_DialogVisible=false">确定</el-button>
            </div>
        </el-dialog>
    </div>

</template>

<script>
    export default {
        name: "Judge",
        data(){
            let checkGrade = (rule,value,cb)=>{
                this.$axios.get('/query_grade?contest_number='+this.contest_number+'&judge_name='+this.judge_name+'&competitor_id='+this.editForm.id)
                    .then(res=>{
                        if(res.data.err_code==1){
                            return cb(new Error(res.data.message))
                        }
                        if(res.data.err_code==500){
                            return cb(new Error('服务器忙，请联系管理员或稍后重试'))
                        }
                        if(res.data.err_code==0){
                            return cb()
                        }
                    })
                    .catch(err=>{
                        cb(new Error('服务器忙，请联系管理员或稍后重试'))
                    })
            }//验证比赛是否已经存在
            return{
                drawer:false,//工具箱
                now_date:'',//当前时间
                contest_number:window.sessionStorage.getItem('contest_number'),//比赛编号
                judge_name:window.sessionStorage.getItem('judge_name'),//评委名称
                judge_id:window.sessionStorage.getItem('judge_id'),//评委名称
                contestInfo:{},//比赛信息
                competitor:[],//选手信息
                competitor_name:null,//选手名称
                contest_rule:[],//比赛规则
                post_grade_DialogVisible:false,//打分对话框状态
                grade_rule_DialogVisible:false,//评分细则对话框
                news_list_DialogVisible:false,//消息列表对话框
                post_grade_arr:[],//打分表单数据数组形式
                post_grade:{},//打分表单数据
                competitor_id:null, //评委要得分的选手id
                is_grade:false,//是否打过分
                grade_status:true,//打分是否正确
                news_list:[],//消息列表
                timer:null,//定时器
                now_time:'00:00:00',
                all_time:0,//定时器所以时间
                time_arr:[],//定时器数组
                timer_status:false,//定时器状态
                anonymity:''//实名或者匿名
            }
        },
        methods:{
            logout(){
                window.sessionStorage.clear();
                this.$router.push('/login');
            },//退出登录
            getContestInfo(){
                this.$axios.get('/get_contest_info?contest_number='+this.contest_number)
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message)
                        }else if(res.data.err_code==1){
                            return this.$message.info(res.data.message)
                        }else{
                            this.contestInfo = res.data.result
                            if(res.data.result.anonymity==1){
                                this.anonymity = '匿名'
                            }else{
                                this.anonymity = '实名'
                            }
                        }
                    })
                    .catch(err=>{
                        return this.$message.error('服务器忙，请联系管理员或稍后重试')
                    })
            },//获取比赛信息
            getCompetitor(){
                this.$axios.get('/get_competitor_info?id='+this.contest_number)
                    .then(res=>{
                        this.competitor = res.data.result
                    })
                    .catch(err=>{
                        return this.$message.error('服务器忙，请联系管理员或稍后重试')
                    })
            },//获取选手信息
            get_contest_rule(){
                this.$axios.get('/get_rule?contest_number='+this.contest_number)
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message)
                        }else{
                            this.contest_rule = res.data.rules;
                        }
                    })
                    .catch(err=>{
                        return this.$message.error('获取比赛规则失败，请联系管理员或稍后重试')
                    })
          },//获取比赛规则
            edit_grade(id,name){
                this.post_grade_DialogVisible = true
                this.competitor_id = id
                this.competitor_name = name
                this.$axios.post('/query_grade',{'competitor_id':this.competitor_id,'judge_id':this.judge_id,'contest_number':this.contest_number})
                    .then(res=>{
                        if(res.data.err_code==500){
                            this.$message.error(res.data.message)
                        }else if(res.data.err_code==1){
                            this.is_grade = true
                            this.$message.info(res.data.message)
                            res.data.grade.forEach((item,index)=>{
                                this.post_grade_arr.push(Number(item.grade))
                            })
                        }
                    })
                    .catch(err=>{
                        return this.$message.error('评分失败，请联系管理员或稍后重试')
                    })
            },//评委打分对话框
            submit_post_grade(){
               let p1 = new Promise((resolve, reject) => {
                   let arr = []
                   for (let i in this.post_grade){
                       arr.push(this.post_grade[i])
                   }
                   if(arr.length<this.contest_rule.length){
                       return this.$message.error(`请填写完整`)
                   }

                   this.grade_exam(arr,this.contest_rule)
                   if(this.grade_status){
                       resolve(arr)
                   }else{
                       this.grade_status = true
                       this.grade_exam(arr,this.contest_rule)
                   }

               })
                p1.then(async (arr)=>{
                   const confirmResult = await this.$confirm('提交后不可更改,继续?', '提示', {
                       confirmButtonText: '提交',
                       cancelButtonText: '取消',
                       type: 'warning'
                   }).catch(err=> err);

                   if(confirmResult !== 'confirm'){
                       return this.$message.info('已取消提交')
                   }

                   let contest_rule_content = []
                    this.contest_rule.forEach((item,index)=>{
                        contest_rule_content.push(item.content)
                    })
                    let post_grade_data = {
                       'grade':arr,
                        'competitor_id':this.competitor_id,
                        'competitor_name':this.competitor_name,
                        'content':contest_rule_content,
                        'judge_id':this.judge_id,
                        'judge_name':this.judge_name,
                        'contest_number':this.contest_number
                    }
                    this.$axios.post('/add_grade',{'post_grade_data':post_grade_data})
                        .then(res=>{
                            if(res.data.err_code==500){
                                return this.$message.error(res.data.message)
                            }else{
                                this.$message.success('评分成功')
                                this.post_grade_DialogVisible = false
                            }
                        })
                        .catch(err=>{
                            return this.$message.error('服务器正忙，请联系管理员或稍后重试')
                        })
               }).catch(err=>{alert(err)})
            },//评委提交评分
            clear_post_grade_arr(){
                this.is_grade = false
                this.post_grade = {}
                this.post_grade_arr = []
            },//评分对话框关闭事件
            grade_exam(arr,contest_rule){
                arr.forEach((item,index)=>{
                    if(!Number(item)){
                        this.grade_status = false
                        return this.$message.error(`第${index+1}处填写错误,完善后双击确认键提交`)
                    }
                    if(item<0){
                        this.grade_status = false
                        return this.$message.error(`第${index+1}处填分数过小,完善后双击确认键提交`)
                    }
                    if(item>contest_rule[index].score){
                        this.grade_status = false
                        return this.$message.error(`第${index+1}处填分数过大,完善后双击确认键提交`)
                    }
                })
            },//验证评分正确
            get_date(){
                setInterval(()=>{
                    let date = new Date()
                    let nowDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + '-' + date.getHours() + ':' + date.getMinutes()+':'+date.getSeconds();
                    this.now_date = nowDate;
                },1000)
            },//获取当前时间
            setTimer(start_number){
                if(this.timer==null){
                    let one_timer = start_number
                    this.timer = setInterval(()=>{
                        one_timer++;

                        let hour = Math.floor(one_timer/3600)
                        if(hour<=0){
                            hour = '00'
                        }else if(hour<10){
                            hour = '0'+ hour;
                        }
                        let min = Math.floor((one_timer - hour*3600)/60)
                        if(min<=0){
                            min = '00'
                        }else if(min<10){
                            min = '0'+ min;
                        }
                        let sec = one_timer%60;
                        if(sec<=0){
                            sec = '00'
                        }else if(sec<10){
                            sec = '0'+ sec;
                        }
                        this.all_time = one_timer
                        this.now_time = `${hour}:${min}:${sec}`
                    },1000)
                }
            },//定时器
            start_timer(){
                if(!this.timer_status){
                    clearInterval(this.timer)
                    this.timer=null
                    this.setTimer(this.all_time)
                    this.timer_status = true
                }else{
                    clearInterval(this.timer)
                    this.timer_status = false
                }
            },//定时器状态
            reset_timer(){
                clearInterval(this.timer)
                this.timer=null
                this.all_time = 0;
                this.now_time = '00:00:00'
                this.timer_status = false
            },//重置定时器
            save_timer(){
                this.time_arr.push(this.now_time)
            },//保存定时
            get_news_list(){
                setInterval(()=>{
                    this.$axios.get('/get_news_list?contest_number='+this.contest_number)
                        .then(res=>{
                            console.log(res.data)
                            this.news_list = res.data.news_list;
                        })
                        .catch(err=>{
                            this.$message.error(`获取管理员消息失败，请联系管理员或稍后重试`)
                        })
                },5000)
            }
        },
        created() {
            this.getContestInfo()
            this.getCompetitor()
            this.get_contest_rule()
            this.get_date()
            this.get_news_list()
        },
        beforeDestroy() {
            this.get_date = null
        }
    }
</script>

<style scoped>
    .el-row{
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
    }
    .el-header{
        background-color: green;
        display: flex;
        justify-content: space-between;
        padding-left: 0;
        align-items: center;
        color:#fff;
        font-size:20px;
    }
    .el-header div{
        display: flex;
        align-items: center;
    }
    .el-header div span{
        margin-left: 15px;
    }
    .el-collapse-item__header{
        text-align: center;
    }
    .el-row{
        display: flex;
        justify-content: left;
    }
    .el-button{
        border:none
    }
    .el-table{
        margin: 10px;
    }
    .el-drawer__body{
        color:black;
    }
</style>