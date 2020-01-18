<template>
    <div>
<!--        导航面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item>评委管理</el-breadcrumb-item>
            <el-breadcrumb-item>评委列表</el-breadcrumb-item>
        </el-breadcrumb>

<!--        卡片视图区域-->
        <el-card>
<!--            搜索框-->
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-input placeholder="请输入内容,可根据姓名/学号/学院/班级进行搜索" v-model="queryInfo.query" clearable @clear="getJudgeList">
                        <el-button slot="append" icon="el-icon-search" @click="getJudgeList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible=true">添加评委</el-button>
                </el-col>
            </el-row>

<!--            评委列表区域-->
            <el-table :data="judge_list" border stripe>
                <el-table-column label="#" type="index" width="50px"></el-table-column>
                <el-table-column label="名称" prop="name"></el-table-column>
                <el-table-column label="密码" prop="password"></el-table-column>
                <el-table-column label="赛场编号" prop="contest_number"></el-table-column>
                <el-table-column label="创建时间" prop="create_time"></el-table-column>
                <el-table-column label="操作" width="130px">
                    <template slot-scope="scope">
                        <!--                        修改按钮-->
                        <el-tooltip class="item" effect="dark" content="修改信息" placement="top" :enterable="false">
                            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialogVisible(scope.row.id)"></el-button>
                        </el-tooltip>

                        <!--                        删除按钮-->
                        <el-tooltip class="item" effect="dark" content="删除用户" placement="top" :enterable="false">
                            <el-button type="primary" size="mini" icon="el-icon-delete" @click="deleteUser(scope.row.id)"></el-button>
                        </el-tooltip>

                    </template>
                </el-table-column>
            </el-table>

            <!--                //分页区域-->
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[1, 5, 10, 100]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>

<!--        添加评委对话框-->
        <el-dialog
                title="添加评委"
                :visible.sync="addDialogVisible"
                width="50%">

<!--            添加评委表单-->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px" @close="addDialogClose">
                <el-form-item label="评委账号" prop="name">
                    <el-input v-model="addForm.name" placeholder="请输入评委账号"></el-input>
                </el-form-item>
                <el-form-item label="登录密码">
                    <el-input v-model="addForm.password" placeholder="不输入则为默认密码：123456"></el-input>
                </el-form-item>
                <el-form-item label="比赛编号" prop="contest_number">
                    <el-input v-model="addForm.contest_number"></el-input>
                </el-form-item>
                <el-form-item label="评委备注">
                    <el-input placeholder="选填,如: **学院**书记" v-model="addForm.comment"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addJudge">确 定</el-button>
  </span>
        </el-dialog>
<!--        修改评委信息对话框-->
        <el-dialog
                @close="editDialogClose"
                title="修改评委信息"
                :visible.sync="editDialogVisible"
                width="50%">
<!--            修改评委信息表单-->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="90px" @close="addDialogClose">
                <el-form-item label="评委名称" prop="name">
                    <el-input placeholder="评委名称" v-model="editForm.name"></el-input>
                </el-form-item>
                <el-form-item label="评委密码" prop="password">
                    <el-input placeholder="评委登录匿名" v-model="editForm.password"></el-input>
                </el-form-item>
                <el-form-item label="比赛编号" prop="contest_number">
                    <el-input placeholder="比赛编号" v-model="editForm.contest_number"></el-input>
                </el-form-item>
                <el-form-item label="评委备注">
                    <el-input placeholder="选填,如: **学院**书记" v-model="editForm.comment"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Judge",
        data(){
            return {
                queryInfo:{
                    query:'',
                    pagenum:1,
                    pagesize:1
                },
                judge_list:[],//评委列表
                total:0,//评委数量
                addDialogVisible:false,//添加评委对话框
                addForm:{

                },//添加评委的信息
                addFormRules:{
                    name:[
                        {required:true,message:'请输入评委账号',trigger:'blur'},
                        {min:2,max:9,message:'用户名长度在2-9个字符之间',trigger: 'blur'}
                    ],
                    password:[
                        {min:2,max:9,message:'密码长度在4-9个字符之间',trigger: 'blur'}
                    ],
                    contest_number:[
                        {required:true,message:'请输入评委所属比赛编号',trigger:'blur'},
                        {min:1,max:6,message:'比赛编号长度在4-5个字符之间',trigger: 'blur'}
                    ]

                },//添加评委规则
                editDialogVisible:false,//修改评委对话框
                editForm:{
                    'id':null,
                    'password':'',
                    'name':'',
                    'contest_number': ''
                },//要修改的评委信息
                editFormRules:{
                    name:[
                        {min:2,max:9,message:'用户名长度在2-9个字符之间',trigger: 'blur'}
                    ],
                    contest_number:[
                        {required:true,message:'请输入评委所属比赛编号',trigger:'blur'},
                        {min:4,max:5,message:'比赛编号长度在4-5个字符之间',trigger: 'blur'}
                    ]

                },//修改评委规则
            }
        },
        methods:{
            getJudgeList(){
                this.$axios.get('/get_judge_list',{params:this.queryInfo})
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message)
                        }
                        this.judge_list = res.data.judge;
                        this.total = res.data.total
                    })
                    .catch(err=>{
                       return this.$message.error('服务器忙，获取评委列表失败，请联系管理员或稍后重试')
                    })
            },
            handleSizeChange(newSize){
                this.queryInfo.pagesize = newSize
                this.getJudgeList()
            },//监听pagesize改变
            handleCurrentChange(newPage){
                this.queryInfo.pagenum = newPage
                this.getJudgeList()
            },//监听页码改变
            addDialogClose(){
                this.$refs.addFormRef.resetFields();
            },//添加评委表单关闭事件
            addJudge(){
                if(!this.addForm.name){
                    this.addForm.name = '匿名评委'
                }
                if(!this.addForm.password){
                    this.addForm.password = '123456'
                }
                this.$refs.addFormRef.validate(valid=>{
                    if(!valid) return
                    this.$axios.post('/judge_register',{params:this.addForm})
                        .then(res=>{
                            if(res.data.err_code != 0){
                                this.$message.error(res.data.message)
                                return;
                            }
                            this.$message.success('添加评委成功');
                            this.addDialogVisible = false;
                            this.getJudgeList();
                        })
                        .catch(err=>{
                            this.$message.error('添加评委失败')
                        })
                })
            },//添加评委
            showEditDialogVisible(id){
                this.$axios.get('/query_judge?id='+id)
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message)
                        }
                        if(res.data.err_code==1){
                            return this.editForm = res.data.judge_info
                        }
                    })
                    .catch(err=>{
                        return this.$message.error('服务器忙，请联系管理员或稍后重试')
                    })
                this.editDialogVisible = !this.editDialogVisible
            },//修改评委对话框
            editDialogClose(){
                this.$refs.editFormRef.resetFields();
            },//评委对话框关闭事件
            editUserInfo(){
                this.$refs.editFormRef.validate(valid=>{
                    if(!valid){
                        return this.$message.error('修改格式不正确')
                    }
                    this.$axios.post('/edit_judge',{editForm:this.editForm})
                        .then(res=>{
                            this.$message.success('修改评委信息成功');
                            this.editDialogVisible = false;
                            this.getJudgeList();
                        })
                        .catch(err=>{
                            return this.$message.error('修改评委信息失败')
                        })
                })
            },//提交修改用户信息
            async deleteUser(id){
                const confirmResult = await this.$confirm('是否永久删除该评委, 继续?', '提示', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err=> err);

                if(confirmResult !== 'confirm'){
                    return this.$message.info('已取消删除')
                }

                this.$axios.post('/delete_judge',{'id':id})
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message)
                        }
                        this.$message.success(res.data.message)
                        this.getJudgeList();
                    })
                    .catch(err=>{
                        return this.$message.error('服务器正忙，请联系管理员或稍后重试');
                    })
            }//删除用户
        },
        created() {
            this.getJudgeList();
        }
    }
</script>

<style scoped>

</style>