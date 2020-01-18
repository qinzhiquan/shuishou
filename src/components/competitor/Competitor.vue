<template>
    <div>
        <!--        导航面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item>参赛者管理</el-breadcrumb-item>
            <el-breadcrumb-item>参赛者列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!--        卡片视图区域-->
        <el-card>
            <!--            搜索框-->
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-input placeholder="请输入内容,可根据姓名/学号/学院/班级进行搜索" v-model="queryInfo.query" clearable @clear="getcompetitorList">
                        <el-button slot="append" icon="el-icon-search" @click="getcompetitorList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible=true">添加参赛者</el-button>
                </el-col>
            </el-row>

            <!--            参赛者列表区域-->
            <el-table :data="competitor_list" border stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="名称" prop="name"></el-table-column>
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

        <!--        添加参赛者对话框-->
        <el-dialog
                title="添加参赛者"
                :visible.sync="addDialogVisible"
                width="50%">

            <!--            添加参赛者表单-->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px" @close="addDialogClose">
                <el-form-item label="名称" prop="name">
                    <el-input placeholder="参赛者名称" v-model="addForm.name"></el-input>
                </el-form-item>
                <el-form-item label="学院">
                    <el-input placeholder="可填可不填" v-model="addForm.academy"></el-input>
                </el-form-item>
                <el-form-item label="班级">
                    <el-input placeholder="可填可不填" v-model="addForm.class"></el-input>
                </el-form-item>
                <el-form-item label="比赛编号" prop="contest_number">
                    <el-input placeholder="比赛编号" v-model="addForm.contest_number"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addcompetitor">确 定</el-button>
  </span>
        </el-dialog>
        <!--        修改参赛者信息对话框-->
        <el-dialog
                @close="editDialogClose"
                title="修改参赛者信息"
                :visible.sync="editDialogVisible"
                width="50%">
            <!--            修改参赛者信息表单-->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="90px" @close="addDialogClose">
                <el-form-item label="参赛者id" prop="id">
                    <el-input v-model="editForm.id" disabled></el-input>
                </el-form-item>
                <el-form-item label="名称" prop="name">
                    <el-input v-model="editForm.name"></el-input>
                </el-form-item>
                <el-form-item label="学院">
                    <el-input v-model="editForm.academy"></el-input>
                </el-form-item>
                <el-form-item label="班级">
                    <el-input v-model="editForm.class"></el-input>
                </el-form-item>
                <el-form-item label="比赛编号" prop="contest_number">
                    <el-input v-model="editForm.contest_number"></el-input>
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
        name: "competitor",
        data(){
            return {
                queryInfo:{
                    query:'',
                    pagenum:1,
                    pagesize:1
                },
                competitor_list:[],//参赛者列表
                total:0,//参赛者数量
                addDialogVisible:false,//添加参赛者对话框
                addForm:{
                    'name':'',
                    'contest_number': ''
                },//添加参赛者的信息
                addFormRules:{
                    name:[
                        {required:true,message:'请输入参赛者名称',trigger:'blur'},
                        {min:2,max:9,message:'用户名长度在2-9个字符之间',trigger: 'blur'}
                    ],
                    contest_number:[
                        {required:true,message:'请输入参赛者所属比赛编号',trigger:'blur'},
                        {min:1,max:6,message:'比赛编号长度在4-5个字符之间',trigger: 'blur'}
                    ]

                },//添加参赛者规则
                editDialogVisible:false,//修改参赛者对话框
                editForm:{
                    'id':null,
                    'name':'',
                    'contest_number': ''
                },//要修改的参赛者信息
                editFormRules:{
                    name:[
                        {required:true,message:'请输入参赛者名称',trigger:'blur'},
                        {min:2,max:9,message:'用户名长度在2-9个字符之间',trigger: 'blur'}
                    ],
                    contest_number:[
                        {required:true,message:'请输入参赛者所属比赛编号',trigger:'blur'},
                        {min:4,max:5,message:'比赛编号长度在4-5个字符之间',trigger: 'blur'}
                    ]

                },//修改参赛者规则
            }
        },
        methods:{
            getcompetitorList(){
                this.$axios.get('/get_competitor_list',{params:this.queryInfo})
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message)
                        }
                        this.competitor_list = res.data.competitor;
                        this.total = res.data.total
                    })
                    .catch(err=>{
                        return this.$message.error('服务器忙，获取参赛者列表失败，请联系管理员或稍后重试')
                    })
            },
            handleSizeChange(newSize){
                this.queryInfo.pagesize = newSize
                this.getcompetitorList()
            },//监听pagesize改变
            handleCurrentChange(newPage){
                this.queryInfo.pagenum = newPage
                this.getcompetitorList()
            },//监听页码改变
            addDialogClose(){
                this.$refs.addFormRef.resetFields();
            },//添加参赛者表单关闭事件
            addcompetitor(){
                this.$refs.addFormRef.validate(valid=>{
                    if(!valid) return
                    this.$axios.post('/competitor_register',{params:this.addForm})
                        .then(res=>{
                            if(res.data.err_code != 0){
                                this.$message.error(res.data.message)
                                return;
                            }
                            this.$message.success('添加参赛者成功');
                            this.addDialogVisible = false;
                            this.getcompetitorList();
                        })
                        .catch(err=>{
                            this.$message.error('添加参赛者失败')
                        })
                })
            },//添加参赛者
            showEditDialogVisible(id){
                this.$axios.get('/query_competitor?id='+id)
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message)
                        }
                        if(res.data.err_code==1){
                            return this.editForm = res.data.competitor_info
                        }
                    })
                    .catch(err=>{
                        return this.$message.error('服务器忙，请联系管理员或稍后重试')
                    })
                this.editDialogVisible = !this.editDialogVisible
            },//修改参赛者对话框
            editDialogClose(){
                this.$refs.editFormRef.resetFields();
            },//参赛者对话框关闭事件
            editUserInfo(){
                this.$refs.editFormRef.validate(valid=>{
                    if(!valid){
                        return this.$message.error('修改格式不正确')
                    }
                    this.$axios.post('/edit_competitor',{editForm:this.editForm})
                        .then(res=>{
                            this.$message.success('修改参赛者信息成功');
                            this.editDialogVisible = false;
                            this.getcompetitorList();
                        })
                        .catch(err=>{
                            return this.$message.error('修改参赛者信息失败')
                        })
                })
            },//提交修改用户信息
            async deleteUser(id){
                const confirmResult = await this.$confirm('是否永久删除该用户, 继续?', '提示', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err=> err);

                if(confirmResult !== 'confirm'){
                    return this.$message.info('已取消删除')
                }

                this.$axios.post('/delete_competitor',{'id':id})
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message)
                        }
                        this.$message.success(res.data.message)
                        this.getcompetitorList();
                    })
                    .catch(err=>{
                        return this.$message.error('服务器正忙，请联系管理员或稍后重试');
                    })
            }//删除用户
        },
        created() {
            this.getcompetitorList();
        }
    }
</script>

<style scoped>

</style>
