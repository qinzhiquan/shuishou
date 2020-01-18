<template>
    <div>
<!--        顶部面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>赛事管理</el-breadcrumb-item>
            <el-breadcrumb-item>赛事列表</el-breadcrumb-item>
        </el-breadcrumb>

<!--        卡片视图区域-->
        <el-card>
<!--            搜索框-->
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="get_contest_list">
                        <el-button slot="append" icon="el-icon-search" @click="get_contest_list"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
<!--                    添加赛事按钮-->
                    <el-button type="primary" @click="add_contest_DialogVisible = true">添加赛事</el-button>
                </el-col>
            </el-row>

<!--            赛事列表区域-->
            <el-table :data="contest_list" border stripe>
                <el-table-column label="比赛编号" prop="contest_number"></el-table-column>
                <el-table-column label="赛名" prop="name"></el-table-column>
                <el-table-column label="主办方" prop="host"></el-table-column>
                <el-table-column label="评委" prop="judge"></el-table-column>
                <el-table-column label="参赛者" prop="competitor"></el-table-column>
                <el-table-column label="创建时间" prop="create_time"></el-table-column>
                <el-table-column label="规则" width="80px">
                    <template slot-scope="scope">
                        <!--                        修改规则按钮-->
                        <el-tooltip class="item" effect="dark" content="修改规则" placement="top" :enterable="false">
                            <el-button type="primary" size="mini" icon="el-icon-edit" @click="show_contest_rule(scope.row.contest_number)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120px">
                    <template slot-scope="scope">
                        <!--                        修改按钮-->
                        <el-tooltip class="item" effect="dark" content="修改信息" placement="top" :enterable="false">
                            <el-button type="primary" size="mini" icon="el-icon-edit" @click="edit_contest(scope.row.contest_number)"></el-button>
                        </el-tooltip>

                        <!--                        删除按钮-->
                        <el-tooltip class="item" effect="dark" content="删除比赛" placement="top" :enterable="false">
                            <el-button type="primary" size="mini" icon="el-icon-delete" @click="delete_contest(scope.row.contest_number)"></el-button>
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
<!--        添加赛事对话框-->
        <el-dialog
                title="添加比赛"
                :visible.sync="add_contest_DialogVisible"
                width="70%">
                <el-form ref="add_contest_form_ref" :model="add_contest_form" :rules="add_contest_rules" label-width="80px">
                    <el-form-item label="比赛编号" prop="contest_number">
                        <el-input v-model="add_contest_form.contest_number"></el-input>
                    </el-form-item>
                    <el-form-item label="比赛名称" prop="name">
                        <el-input v-model="add_contest_form.name"></el-input>
                    </el-form-item>
                    <el-form-item label="主办方" prop="host">
                        <el-input v-model="add_contest_form.host"></el-input>
                    </el-form-item>
                    <el-form-item label="匿名评分" prop="host" style="color:green;">
                        <input type="radio" v-model="add_contest_form.anonymity" name="anonymity" value="1"/>是
                        <input type="radio" v-model="add_contest_form.anonymity" name="anonymity" value="0"/>否
                    </el-form-item>
                </el-form>

                <div slot="footer" class="dialog-footer">
                    <el-button @click="add_contest_DialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="add_contest">确定</el-button>
                </div>
        </el-dialog>

        <el-dialog
                @close="editDialogClose"
                title="修改比赛信息"
                :visible.sync="editDialogVisible"
                width="70%">
            <!--            修改比赛信息表单-->
            <el-form :model="edit_contest_form" :rules="edit_contest_form_rules" ref="editFormRef" label-width="90px">
                <el-form-item label="比赛编号">
                    <el-input v-model="edit_contest_form.contest_number" disabled></el-input>
                </el-form-item>
                <el-form-item label="匿名评分">
                    <el-input v-model="edit_contest_form.anonymity" disabled></el-input>
                </el-form-item>
                <el-form-item label="比赛名称" prop="name">
                    <el-input v-model="edit_contest_form.name"></el-input>
                </el-form-item>
                <el-form-item label="主办方" prop="name">
                    <el-input v-model="edit_contest_form.host"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="submit_edit_form">确 定</el-button>
  </span>
        </el-dialog>
        <!--    规则列表表单对话框-->
        <el-dialog
                @close="rule_list_DialogVisible_close"
                width="80%"
                title="规则列表"
                :visible.sync="rule_list_DialogVisible"
                append-to-body>
            <p>
                <el-button @click="add_rule_DialogVisible = true">添加规则</el-button>
            </p>
            <el-table :data="rule_list" border stripe>
                <el-table-column label="#" type="index" width="50px"></el-table-column>
                <el-table-column label="内容" prop="content" width="100px"></el-table-column>
                <el-table-column label="分数" prop="score" width="50px"></el-table-column>
                <el-table-column label="要求" prop="request"></el-table-column>
                <el-table-column label="操作" width="120px">
                    <template slot-scope="scope">
                        <!--                        修改按钮-->
                        <el-tooltip class="item" effect="dark" content="修改规则" placement="top" :enterable="false">
                            <el-button type="primary" size="mini" icon="el-icon-edit" @click="edit_rule(scope.$index)"></el-button>
                        </el-tooltip>

                        <!--                        删除按钮-->
                        <el-tooltip class="item" effect="dark" content="删除规则" placement="top" :enterable="false">
                            <el-button type="primary" size="mini" icon="el-icon-delete" @click="delete_rule(scope.$index)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button @click="rule_list_DialogVisible=false">取 消</el-button>
                <el-button type="primary" @click="submit_rule_form">确定</el-button>
            </div>
        </el-dialog>

        <!--    修改规则对话框-->
        <el-dialog
                width="60%"
                title="修改规则"
                :visible.sync="edit_rule_DialogVisible"
                append-to-body>
            <el-form ref="form" :model="edit_rule_form" label-width="80px">
                <el-form-item label="内容">
                    <el-input v-model="edit_rule_form.content"></el-input>
                </el-form-item>
                <el-form-item label="分数">
                    <el-input v-model="edit_rule_form.score"></el-input>
                </el-form-item>
                <el-form-item label="要求">
                    <el-input type="textarea" rows="5" v-model="edit_rule_form.request"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="edit_rule_DialogVisible=false">确定</el-button>
            </div>
        </el-dialog>

<!--    添加规则对话框-->
        <el-dialog
                width="60%"
                title="添加规则"
                :visible.sync="add_rule_DialogVisible"
                append-to-body>
            <el-form ref="add_rule_DialogVisible_ref" :rules="add_rule_form_rule" :model="add_rule_form" label-width="80px">
                <el-form-item label="内容" prop="content">
                    <el-input v-model="add_rule_form.content"></el-input>
                </el-form-item>
                <el-form-item label="分数" prop="score">
                    <el-input type="number" v-model.number="add_rule_form.score"></el-input>
                </el-form-item>
                <el-form-item label="要求" prop="request">
                    <el-input v-model="add_rule_form.request"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="add_rule_DialogVisible=false">取 消</el-button>
                <el-button type="primary" @click="submit_one_add_rule_form">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Competition",
        data(){
            const add_contest_selfRules = (rule, value, callback) => {
                this.$axios.get('/query_contest_number?contest_number='+this.add_contest_form.contest_number)
                    .then(res=>{
                        if(res.data.err_code==500){
                            return callback(new Error(res.data.message));
                        }else if(res.data.err_code==1){
                            return callback(new Error(res.data.message));
                        }else{
                            return callback();
                        }
                    })
                    .catch(err=>{
                        return callback(new Error('服务器正忙，请联系管理员或稍后重试'));
                    })
            };//添加比赛自定义规则
            return {
                total:null,
                queryInfo:{
                    query:'',
                    pagenum:1,
                    pagesize:5
                },
                contest_list:[],//比赛列表
                editDialogVisible:false,//修改比赛对话框
                add_contest_DialogVisible:false,//添加比赛
                add_rule_DialogVisible:false,//添加规则
                rule_list_DialogVisible:false,//规则列表
                edit_rule_DialogVisible:false,//修改规则
                add_contest_form:{
                    'contest_number':null,
                    'name':'',
                    'host':'',
                    'anonymity':0
                },//添加比赛表单
                edit_contest_form:{
                    'contest_number':null,
                    'name':'',
                    'host':'',
                    'anonymity':null
                },//修改比赛表单
                add_contest_rules:{
                    name:[
                        {required:true,message:'请输入比赛名称',trigger:'blur'},
                        {min:2,max:9,message:'长度在2-9个字符之间',trigger: 'blur'}
                    ],
                    contest_number:[
                        {required:true,message:'请输入比赛编号',trigger:'blur'},
                        {min:4,max:5,message:'比赛编号长度在4-5个字符之间',trigger: 'blur'},
                        { validator: add_contest_selfRules, trigger: 'blur' }
                    ],
                    host:[
                        {required:true,message:'请输入主办方名称或比赛地点',trigger:'blur'},
                    ]
                },//添加比赛表单规则
                edit_contest_form_rules:{
                    name:[
                        {required:true,message:'请输入比赛名称',trigger:'blur'},
                        {min:2,max:9,message:'长度在2-9个字符之间',trigger: 'blur'}
                    ],
                    host:[
                        {required:true,message:'请输入主办方名称或比赛地点',trigger:'blur'},
                        {min:2,max:30,message:'长度在2-30个字符之间',trigger: 'blur'}
                    ]
                },//修改比赛表单规则
                rule_list:[],//比赛规则列表
                edit_rule_form:{
                    'content':'',
                    'score':'',
                    'request':''
                },//修改规则
                add_rule_form:{
                    'content':'',
                    'score':'',
                    'request':''
                },//添加的比赛规则
                add_rule_form_rule:{
                    content:[
                        {required:true,message:'请输入内容',trigger:'blur'},
                        {min:2,max:9,message:'长度在2-9个字符之间',trigger: 'blur'}
                    ],
                    score:[
                        {required:true,message:'请输入纯数字分值',trigger:'blur'}
                    ],
                    request:[
                        {required:true,message:'请输入要求',trigger:'blur'},
                        {max:200,message:'长度在200子以内',trigger: 'blur'}
                    ]
                },//添加规则表单的规则
                submit_rule_form_contest_number:null//要提交规则的比赛的编号
            }
        },
        methods:{
            get_contest_list(){
                this.$axios.get('/get_contest_list',{params:this.queryInfo})
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message)
                        }
                        this.contest_list = res.data.contest_list;
                        this.total = res.data.total
                    })
                    .catch(err=>{
                        return this.$message.error('服务器忙，获取比赛列表失败，请联系管理员或稍后重试')
                    })
            },//获取比赛列表
            add_contest(){
                this.$refs.add_contest_form_ref.validate(valid=>{
                    if(!valid) return
                    this.$axios.post('/add_contest',{params:this.add_contest_form})
                        .then(res=>{
                            if(res.data.err_code==500){
                                return  this.$message.error(res.data.message)
                            }else if(res.data.err_code==0){
                                this.$message.success('添加成功')
                                this.add_contest_DialogVisible = false;
                                this.get_contest_list();
                            }
                        })
                        .catch(err=>{
                            return this.$message.error('服务器正忙，请联系管理员或稍后重试')
                        })
                })
            },//添加比赛
            handleSizeChange(newSize){
                this.queryInfo.pagesize = newSize
                this.get_contest_list()
            },//监听pagesize改变
            handleCurrentChange(newPage){
                this.queryInfo.pagenum = newPage
                this.get_contest_list()
            },//监听页码改变
            editDialogClose(){
                this.$refs.editFormRef.resetFields();
            },//修改比赛对话框关闭事件
            edit_contest(contest_number){
                this.editDialogVisible = true
                this.$axios.get('/query_contest_number?contest_number='+contest_number)
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message);
                        }else if(res.data.err_code==0){
                            return this.$message.error(res.data.message);
                        }else{
                            this.edit_contest_form = res.data.contest[0];
                            if(res.data.contest[0].anonymity==0){
                                this.edit_contest_form.anonymity='否'
                            }else{
                                this.edit_contest_form.anonymity='是'
                            }
                        }
                    })
                    .catch(err=>{
                        return this.$message.error('服务器正忙，请联系管理员或稍后重试');
                    })
            },//获取修改比赛信息
            submit_edit_form(){
                this.$axios.post('/edit_contest',{editForm:this.edit_contest_form})
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message);
                        }else{
                            this.$message.success(res.data.message);
                            this.editDialogVisible = false
                            this.get_contest_list()
                        }
                    })
                    .catch(err=>{
                        return this.$message.error('服务器正忙，请联系管理员或稍后重试');
                    })
            },//提交修改比赛信息
            async delete_contest(contest_number){
                    const confirmResult = await this.$confirm('是否删除比赛及其所有相关数据（评委、选手、成绩等），删除后不可恢复,继续?', '提示', {
                        confirmButtonText: '删除',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).catch(err=> err);

                    if(confirmResult !== 'confirm'){
                        return this.$message.info('已取消删除')
                    }
                this.$axios.post('/delete_contest',{contest_number:contest_number})
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message);
                        }else{
                            this.$message.success(res.data.message);
                            this.get_contest_list()
                        }
                    })
                    .catch(err=>{
                        return this.$message.error('服务器正忙，请联系管理员或稍后重试');
                    })
            },//删除比赛
            edit_rule(id){
                this.edit_rule_form = this.rule_list[id];
                this.edit_rule_DialogVisible = true
            },//修改规则
            delete_rule(id){
                 this.rule_list.splice(id,1);
                 this.$message.success('删除成功');
                 this.get_contest_list();
            },//删除规则
            submit_one_add_rule_form(){
                this.rule_list.push(this.add_rule_form);
                this.add_rule_form = {
                    'content':'',
                    'score':'',
                    'request':''
                }
                this.add_rule_DialogVisible = false
            },//添加规则
            rule_list_DialogVisible_close(){

            },//规则列表对话框关闭事件
            show_contest_rule(contest_number){
                this.$axios.get('/get_rule?contest_number='+contest_number)
                    .then(res=>{
                        if(res.data.err_code==500){
                            this.$message.error(res.data.message);
                        }else{
                            this.rule_list = res.data.rules;
                        }
                    })
                    .catch(err=>{
                        this.$message.error('服务器正忙，请联系管理员或稍后重试');
                    })
                this.submit_rule_form_contest_number = contest_number
                this.rule_list_DialogVisible=true
            },//获取该比赛编号的比赛规则
            async submit_rule_form(){
                const confirmResult = await this.$confirm('是否更改比赛规则,点击取消不做更改，继续?', '提示', {
                    confirmButtonText: '提交',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err=> err);

                if(confirmResult !== 'confirm'){
                    return this.$message.info('已取消更改')
                }
                this.$axios.post('/add_rule',{'contest_number':this.submit_rule_form_contest_number,rule:this.rule_list})
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message)
                        }
                        this.$message.success(res.data.message)
                        this. rule_list_DialogVisible = false
                    })
                    .catch(err=>{
                        return this.$message.error('服务器正忙，请联系管理员或稍后重试');
                    })
            }//提交规则表单
        },
        mounted() {
            this.get_contest_list()
        }
    }
</script>
<style scoped>
    p{text-align: right}
</style>