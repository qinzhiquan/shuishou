<template>
    <div>
        <!--                显示时间-->
        <div>
            <p>
                <span>当前时间:</span>

                {{now_date}}
            </p>
        </div>
        <hr/>
        <!--                定时器-->
        <el-collapse>
            <el-collapse-item title="定时器" name="1">
                <el-card>
                    <el-button size="mini">定时器：</el-button>
                    <br/>
                    <el-tooltip class="item" effect="dark" content="点击开始|暂定记时" placement="top" :enterable="false">
                        <el-button size="mini" @click="start_timer">{{now_time}}</el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="重置定时器" placement="top" :enterable="false">
                        <el-button size="mini" @click="reset_timer">重置</el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="保存定时" placement="top" :enterable="false">
                        <el-button size="mini" @click="save_timer">保存</el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="清空所有定时" placement="top" :enterable="false">
                        <el-button size="mini" @click="delete_timer">清空</el-button>
                    </el-tooltip>
                </el-card>
                <el-card v-if="time_arr[0]">
                    <el-tag v-for="(item,index) in time_arr" :key="index" size="mini">{{item}}</el-tag>
                </el-card>
            </el-collapse-item>
            <!--                发送消息-->
            <el-collapse-item title="发送消息" name="2">
                <el-card>
                   <p v-if="contest_list[0]">
                       <el-tooltip v-for="item in contest_list" class="item" effect="dark" content="点击即发送消息" placement="top" :enterable="false">
                           <el-button class="post_news" size="mini" @click="post_news(item.contest_number,item.name)">{{item.name}}</el-button>
                       </el-tooltip>
                   </p>
                    <textarea rows="3" cols="70" v-model="news" placeholder="请输入消息内容"></textarea>
                </el-card>
                <p>
                    <el-button sizi="mini" style="font-size: 10px" @click="get_news_list">历史消息:</el-button><br/>
                    <el-tag v-for="(item,index) in news_list" :key="index" size="mini">{{item}}</el-tag>
                </p>
            </el-collapse-item>
        </el-collapse>

    </div>
</template>

<script>
    export default {
        name: "Toolbox",
        data(){
            return{
                now_date:'',//当前时间
                news:'',//发给评委的消息内容
                news_list:[],//消息列表
                contest_list:[]//比赛列表
            }
        },
        methods:{
            get_date(){
                setInterval(()=>{
                    let date = new Date()//保存注册日期
                    let nowDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + '-' + date.getHours() + ':' + date.getMinutes()+':'+date.getSeconds();
                    this.now_date = nowDate;
                },1000)
            },//获取当前时间
            setTimer(start_number){
                if(this.time==null){
                    let one_timer = start_number
                    this.$store.commit('time',setInterval(()=>{
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
                        this.$store.commit('all_time',one_timer)
                        this.$store.commit('now_time',`${hour}:${min}:${sec}`)
                    },1000))
                }
            },//定时器
            start_timer(){
                if(!this.timer_status){
                    clearInterval(this.time)
                    this.$store.commit('time',null)
                    this.setTimer(this.all_time)
                    this.$store.commit('timer_status',true)
                }else{
                    clearInterval(this.time)
                    this.$store.commit('timer_status',false)
                }
            },//定时器状态
            reset_timer(){
                clearInterval(this.time)
                this.$store.commit('time',null)
                this.$store.commit('all_time',0)
                this.$store.commit('now_time','00:00:00')
                this.$store.commit('timer_status',false)
            },//重置定时器
            save_timer(){
                this.$store.commit('push_timer',this.now_time)
            },//保存定时
            delete_timer(){
                this.$store.commit('delete_timer')
            },
            get_contest_list(){
                this.$axios.get('/get_contest_anonymity')
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message)
                        }
                        this.contest_list = res.data.contest;
                    })
                    .catch(err=>{
                        return this.$message.error('服务器忙，获取比赛列表失败，请联系管理员或稍后重试')
                    })
            },//获取比赛列表
            post_news(contest_number,name){
                let news = this.news+' --- '+this.now_date
                this.$axios.post('/post_news',{'news':news,'contest_number':contest_number})
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message)
                        }
                        this.$message.success(`发送成功`);
                        this.news_list.unshift(contest_number+' : '+this.news+' --- '+this.now_date);
                    })
                    .catch(err=>{
                        return this.$message.error(`系统忙，发送消息失败，请联系管理员或稍后重试`)
                    })
            },
            get_news_list(){
                this.$axios.get('/get_all_news')
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message)
                        }
                        let list = []
                        res.data.news_list.forEach((item)=>{
                            list.push(`${item.contest_number}:${item.news}`)
                        })
                        this.news_list = list
                    })
                    .catch(err=>{
                        return this.$message.error(`系统忙，发送消息失败，请联系管理员或稍后重试`)
                    })
            }
        },
        computed:{
            time_arr(){
                return this.$store.state.timer
            },
            now_time(){
                return this.$store.state.now_time
            },
            all_time(){
                return this.$store.state.all_time
            },
            time(){
                return this.$store.state.time
            },
            timer_status(){
                return this.$store.state.timer_status
            }
        },
        created() {
            this.get_date()
            this.get_contest_list();
        },
        beforeDestroy() {
            this.get_date = null;
            // this.setTimer = null
        }
    }
</script>

<style scoped>
    .el-button--mini, .el-button--mini.is-round{
        margin-bottom: 10px;
    }
    .el-tag--mini{
        margin: 5px;
    }
</style>