<template>
    <div>
        <form id="login_form">
            <h3>登录</h3>
            <el-tag v-if="login_warn" class="warn">{{login_warn}}</el-tag>
            <el-tag v-else class="welcome">欢迎使用水手评分系统</el-tag>
            <p>身份：
                <select v-model="login_id" required>
                    <option disabled value="0">---请选择身份---</option>
                    <option value="judge">评委</option>
                    <option value="admin">后台管理员</option>
                </select>
            </p>

            <p v-if="login_id=='judge'">名称：<input v-model="login_name" required name="name" type="text" placeholder="动画评委1"></p>
            <p v-else>账号：<input v-model="login_name" required name="name" type="text" placeholder="root"></p>

            <p v-if="login_id=='judge'">
                密码：<input v-model="login_password" required type="password" name="password" placeholder="123456">
                <br/><br/>
                编号：<input v-model="contest_number" required type="number" name="password" placeholder="0001">
            </p>
            <p v-else>密码：<input v-model="login_password" required type="password" name="password" placeholder="root">
            </p>

            <p>
                <input type="submit" @click.prevent="login" value="登录">
                <input type="reset" value="清空">
            </p>
            <p>
                <button @click.prevent="forget_password">忘记密码</button>
                <button @click.prevent="feedback_DialogVisible=true">反馈</button>
                <button @click.prevent="support_DialogVisible=true">联系</button>
            </p>
        </form>
<!--        反馈对话框-->
        <el-dialog
                title="反馈"
                :visible.sync="feedback_DialogVisible"
                width="90%">
            <el-form ref="feedback_from_ref" :model="feedback_form" label-width="70px">
                <el-form-item label="姓名">
                    <el-input placeholder="姓名" v-model="feedback_form.name"></el-input>
                </el-form-item>
                <el-form-item label="联系">
                    <el-input placeholder="联系方式" v-model="feedback_form.phone"></el-input>
                </el-form-item>
                <el-form-item label="反馈">
                    <textarea required placeholder="建议或者意见、反馈" v-model="feedback_form.suggest"></textarea>
                </el-form-item>
                <el-button @click="feedback_DialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submit_feedback">确定</el-button>
            </el-form>
        </el-dialog>

<!--        支持对话框-->
        <el-dialog
                title="联系"
                :visible.sync="support_DialogVisible"
                width="90%">
            <el-collapse>
                <el-collapse-item title="联系作者" name="1">
                    <h5>作者正在找工作，欢迎联系^_^</h5>
                    <table>
                        <thead>
                        <tr>
                            <td><el-tag>QQ:1643711109</el-tag></td>
                            <td><el-tag>微信:1643711109</el-tag></td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td><img src="../assets/qq.jpg"></td>
                            <td><img src="../assets/vx.png"></td>
                        </tr>
                        </tbody>
                    </table>

                    <el-tag>手机:15078552193</el-tag>
                </el-collapse-item>
            </el-collapse>
            <el-collapse>
                <el-collapse-item title="支持作者" name="2">
                    <table>
                        <thead>
                        <tr>
                            <td><el-tag>QQ</el-tag></td>
                            <td><el-tag>微信</el-tag></td>
                            <td><el-tag>支付宝</el-tag></td>
                        </tr>
                        </thead>
                        <tbody>jpg
                        <tr>
                            <td><img src="../assets/qq2.jpg"></td>
                            <td><img src="../assets/vx2.jpg"></td>
                            <td><img src="../assets/my.jpg"></td>
                        </tr>
                        </tbody>
                    </table>
                </el-collapse-item>
            </el-collapse>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "login",
        data(){
            return{
                login_id:'judge',
                login_name:'',
                login_password:'',
                contest_number:'',
                login_warn:null,
                feedback_DialogVisible:false,//反馈
                support_DialogVisible:false,//支持
                feedback_form:{},
            }
        },
        methods:{
            login(){
                this.$axios.post('/login',{
                    login_id:this.login_id,
                    login_name:this.login_name,
                    login_password:this.login_password,
                    contest_number:this.contest_number
                })
                    .then(res=>{
                        let err_code = res.data.err_code;
                        if(err_code==1){
                            return this.$message.info(res.data.message);
                        }else if (err_code==500){
                            return this.$message.info(res.data.message);
                        }else if(err_code==0){
                            if(res.data.login_id=='admin'){
                                window.sessionStorage.setItem('token',res.data.token);//存储服务器分配的koken
                                this.$router.push('/home');
                                return ;
                            }//管理员调转至home页面
                            if(res.data.login_id=='judge'){
                                window.sessionStorage.setItem('token',res.data.token);//存储服务器分配的koken
                                window.sessionStorage.setItem('contest_number',res.data.contest_number)
                                window.sessionStorage.setItem('judge_name',res.data.judge_name)
                                window.sessionStorage.setItem('judge_id',res.data.judge_id)
                                this.$router.push('/judge');
                                return ;
                            }//评委调转至judge页面
                        }
                    })
                    .catch(err=>{
                        return this.$message.error(`系统出错，请联系管理员或稍后重试`)
                    })

            },
            forget_password(){
                this.$message.info(`请点击支持反馈联系管理员或程序员`)
            },
            submit_feedback(){
                this.$axios.post('/post_suggest',{feedback_form:this.feedback_form})
                    .then(res=>{
                        if(res.data.err_code==500){
                            return  this.$message.error(res.data.message)
                        }else if(res.data.err_code==0){
                            this.$message.success(`提交成功，感谢您的宝贵意见。`)
                            this.feedback_DialogVisible = false
                        }
                    })
                    .catch(err=>{
                        return this.$message.error('服务器正忙，请联系管理员或稍后重试')
                    })
            }
        },
        created() {
        }
    }

</script>

<style xml:lang="less" scoped>
    div{
        width:100%;
    }
    h1{
        text-align: center;
    }
    form{
        text-align: center;
        padding: 20px;
        border: 1px green double;
        width: 70%;
        margin: 10% auto;
    }
    select{
        display: inline-block;
        width: 173px;
        height: 21px;
    }
    .welcome{
        font-size: 0.7em;
        color:green;
    }
    .warn{
        font-size: 0.7em;
        color:red;
    }
    input,button{
        margin:0px 10px;
    }
    textarea{
        width:90%
    }
    .el-tag{
        margin: 10px;
    }
    img{
        width:90%;
    }
</style>