<template>
    <div>
        <!--        导航面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据管理</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
        </el-breadcrumb>

        <!--        卡片视图区域-->
        <el-collapse>
            <el-collapse-item title="成绩分项" name="1">
                <el-card>
            <!--            搜索框-->
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="get_grade_list">
                        <el-button slot="append" icon="el-icon-search" @click="get_grade_list"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!--            成绩列表区域-->
            <el-table :data="grade_list" border stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="比赛编号" prop="contest_number"></el-table-column>
                <el-table-column label="选手编号" prop="competitor_id"></el-table-column>
                <el-table-column label="选手名称" prop="name"></el-table-column>
                <el-table-column label="评委编号" prop="judge_id"></el-table-column>
                <el-table-column label="评委名称" prop="judge_name"></el-table-column>
                <el-table-column label="成绩项" prop="contest_content"></el-table-column>
                <el-table-column label="成绩" prop="grade"></el-table-column>
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
            </el-collapse-item>
        </el-collapse>

        <el-collapse>
            <el-collapse-item title="成绩汇总" name="2">
        <!--        卡片视图区域-->
                <el-card>
            <!--            搜索框-->
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-input placeholder="请输入搜索内容" v-model="ope_grade_queryInfo.query" clearable @clear="get_ope_grade">
                        <el-button slot="append" icon="el-icon-search" @click="get_ope_grade"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!--            成绩列表区域-->
            <el-table :data="ope_grade_list" border stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="比赛编号" prop="contest_number"></el-table-column>
                <el-table-column label="选手编号" prop="competitor_id"></el-table-column>
                <el-table-column label="选手名称" prop="competitor_name"></el-table-column>
                <el-table-column label="评委编号" prop="judge_id"></el-table-column>
                <el-table-column label="评委名称" prop="judge_name"></el-table-column>
                <el-table-column label="总分" prop="grade"></el-table-column>
            </el-table>

            <!--平均分、总分-->
            <el-table :data="finally_grade" border stripe>
                <el-table-column label="所有分数" prop="total_grade"></el-table-column>
                <el-table-column label="最高分" prop="max_grade"></el-table-column>
                <el-table-column label="最低分" prop="min_grade"></el-table-column>
                <el-table-column label="平均分" prop="ave_grade"></el-table-column>
                <el-table-column label="去掉最高分最低分后"></el-table-column>
                <el-table-column label="所有分数" prop="ope_total_grade"></el-table-column>
                <el-table-column label="平均分" prop="ope_ave_grade"></el-table-column>
            </el-table>
            <!--页码区域-->
            <el-pagination
                    @size-change="ope_grade_handleSizeChange"
                    @current-change="ope_grade_handleCurrentChange"
                    :current-page="ope_grade_queryInfo.pagenum"
                    :page-sizes="[1, 5, 10, 100]"
                    :page-size="ope_grade_queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="ope_grade_total">
            </el-pagination>
        </el-card>
            </el-collapse-item>
        </el-collapse>

<!--        名次排行-->
        <el-collapse>
            <el-collapse-item title="名次排行" name="3">
                <p v-if="contest_list">
                    <span>是否去掉一个最高分和一个最低分？</span>
                    <input type="radio" @click="get_grade_ranking(checked_contest_number)" v-model="take_out" name="anonymity" value="1"/>是
                    <input type="radio" @click="get_grade_ranking(checked_contest_number)" v-model="take_out" name="anonymity" value="0"/>否
                    <el-button @click="exportToExcel_ranking" type="primary" size="mini" style="margin: 10px">导出Excel</el-button>
                    <br/>
                    <el-tooltip v-for="item in contest_list" :key="item.contest_number" class="item" effect="dark" content="点击查看名次" placement="top" :enterable="false">
                        <el-button size="mini" style="margin: 10px" @click="get_grade_ranking(item.contest_number)">{{item.name}}</el-button>
                    </el-tooltip>
                </p>
                <p v-else>暂无比赛</p>

                <!--            名次排行区域-->
                <el-table :data="ope_grade_ranking" border stripe>
                    <el-table-column label="选手编号" prop="competitor_id"></el-table-column>
                    <el-table-column label="选手名称" prop="competitor_name"></el-table-column>
                    <el-table-column label="所有分数" prop="all_grade"></el-table-column>
                    <el-table-column label="总分" prop="total_grade"></el-table-column>
                    <el-table-column label="平均分" prop="ave_grade"></el-table-column>
                    <el-table-column label="名次" type="index"></el-table-column>
                </el-table>

            </el-collapse-item>
        </el-collapse>

<!--        导出Excel-->
        <el-collapse>
            <el-collapse-item title="导出Excel" name="4">
                <el-cascader
                    ref="contest_value_ref"
                    placeholder="请选择内容"
                    v-model="contest_value"
                    :options="contest_options"
                    @change="handleChange"
                    clearable
                    @clear="clear_contest_value"
                >
                </el-cascader>
                <el-button @click="exportToExcel" type="primary" size="mini" style="margin: 10px">导出Excel</el-button>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script>
    export default {
        name: "Information",
        data(){
            return {
                queryInfo:{
                    query:'',
                    pagenum:1,
                    pagesize:5
                },//页码区域
                grade_list:[],//成绩列表
                total:null,//成绩条数
                ope_grade_list:[],
                ope_grade_total:null,
                finally_grade:[{'total_grade':'','max_grade':null,'min_grade':null,'ave_grade':null,'ope_total_grade':'','ope_ave_grade':null}],//操作后分数
                ope_grade_queryInfo:{
                    query:'',
                    pagenum:1,
                    pagesize:5
                },//页码区域
                all_ope_grade:[],//所以相加后成绩
                contest_anonymity:{},//比赛是否匿名
                contest_list:[],//比赛列表
                take_out:0,//是否去掉最高分最低分
                ope_grade_ranking:[],//操作中名次
                checked_contest_number:null,//是否去掉最高分最低分后刷新的比赛
                contest_value:[],//选择excel下载
                contest_options:[],//联级选择器
                Excel_list:null//excel数据
            }
        },
        methods:{
            get_contest_list(){
                this.$axios.get('/get_contest_anonymity')
                    .then(res=>{
                        res.data.contest.forEach((item,index)=>{
                            let contest_number = item.contest_number;
                            let anonymity = item.anonymity;
                            this.contest_anonymity[contest_number] = anonymity
                        })
                        this.contest_list = res.data.contest
                        res.data.contest.forEach((item,index)=>{
                            this.contest_options.push({'value':item.contest_number,'label':item.name,
                                'children':[
                                    {
                                        'value':'judge',
                                        'label':'评委列表'
                                    },
                                    {
                                        'value':'competitor',
                                        'label':'选手列表'
                                    },
                                    {
                                        'value':'grade',
                                        'label':'成绩列表'
                                    },
                                    {
                                        'value':'ranking',
                                        'label':'名次排行',
                                        'children':[
                                            {
                                                'value':'true',
                                                'label':'去掉最高分最低分'
                                            },
                                            {
                                                'value':'false',
                                                'label':'不去掉最高分最低分'
                                            }
                                        ]
                                    }
                                ]})
                        })
                    })
                    .catch(err=>{
                        return this.$message.error('服务器忙，获取比赛列表失败，请联系管理员或稍后重试')
                    })
            },//获取比赛列表
            get_grade_list(){
                this.$axios.get('/get_grade_list',{params:this.queryInfo})
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message)
                        }
                        this.grade_list = res.data.grade;
                       for(let key in this.contest_anonymity){
                           let contest_number = key;
                           let anonymity = this.contest_anonymity[key];
                           this.grade_list.forEach((item,index)=>{
                               if(item.contest_number == contest_number && anonymity ==1){
                                   item.judge_id = '匿名'
                                   item.judge_name = '匿名'
                               }
                           })
                       }
                        this.total = res.data.total
                    })
                    .catch(err=>{
                        return this.$message.error('服务器忙，获取成绩列表失败，请联系管理员或稍后重试')
                    })
            },//获取成绩列表
            handleSizeChange(newSize){
                this.queryInfo.pagesize = newSize
                this.get_grade_list()
            },//监听pagesize改变
            handleCurrentChange(newPage){
                this.queryInfo.pagenum = newPage
                this.get_grade_list()
            },//监听页码改变
            ope_grade_handleSizeChange(newSize){
                this.ope_grade_queryInfo.pagesize = newSize
                this.get_ope_grade()
            },//监听pagesize改变
            ope_grade_handleCurrentChange(newPage){
                this.ope_grade_queryInfo = newPage
                this.get_ope_grade()
            },//监听页码改变
            get_ope_grade(){
                this.$axios.get('/get_ope_grade_list',{params:this.ope_grade_queryInfo})
                    .then(res=>{
                        if(res.data.err_code==500){
                            return this.$message.error(res.data.message)
                        }

                        this.finally_grade = [{'total_grade':'','max_grade':null,'min_grade':null,'ave_grade':null,'ope_total_grade':'','ope_ave_grade':null}]
                        this.all_ope_grade = []
                        res.data.grade.forEach((item,index)=>{
                            this.all_ope_grade.push(Number(item.grade))
                            this.finally_grade[0].total_grade += `${item.grade},`
                        })
                        this.finally_grade[0].max_grade = Math.max(...this.all_ope_grade)
                        this.finally_grade[0].min_grade = Math.min(...this.all_ope_grade)

                        this.all_ope_grade.forEach((item,index)=>{
                            this.finally_grade[0].ave_grade += item;
                        })

                        this.finally_grade[0].ave_grade = (this.finally_grade[0].ave_grade/this.all_ope_grade.length).toFixed(2)

                        this.all_ope_grade.forEach((item,index)=>{
                            if(item==this.finally_grade[0].max_grade){
                                this.all_ope_grade.splice(index,1)
                            }
                        })
                        this.all_ope_grade.forEach((item,index)=>{
                            if(item==this.finally_grade[0].min_grade){
                                this.all_ope_grade.splice(index,1)
                            }
                        })
                        this.all_ope_grade.forEach((item,index)=>{
                            this.finally_grade[0].ope_total_grade += `${item},`
                        })

                        if(this.all_ope_grade[0]){
                            this.all_ope_grade.forEach((item,index)=>{
                                this.finally_grade[0].ope_ave_grade += item;
                            })

                            this.finally_grade[0].ope_ave_grade = (this.finally_grade[0].ope_ave_grade/this.all_ope_grade.length).toFixed(2)
                        }

                        this.ope_grade_list = res.data.grade;
                        this.ope_grade_total = res.data.total

                        for(let key in this.contest_anonymity){
                            let contest_number = key;
                            let anonymity = this.contest_anonymity[key];
                            this.ope_grade_list.forEach((item,index)=>{
                                if(item.contest_number == contest_number && anonymity ==1){
                                    item.judge_id = '匿名'
                                    item.judge_name = '匿名'
                                }
                            })
                        }
                    })
                    .catch(err=>{
                        return this.$message.error('服务器忙，获取成绩汇总失败，请联系管理员或稍后重试')
                    })
            },//获取总成绩
            get_grade_ranking(contest_number){
                this.checked_contest_number = contest_number
                this.$axios.get('/get_grade_ranking?contest_number='+contest_number)
                    .then(res=>{
                        let grade = res.data.grade;//所有成绩数组
                        let map = {};
                        let dest = [];//根据competitor_id分类后的数组
                        grade.forEach((item,index)=>{
                            if(!map[item.competitor_id]){
                                dest.push({
                                    'competitor_id':item.competitor_id,
                                    'competitor_name':item.competitor_name,
                                    'all_grade_2':[item.grade]
                                })
                                map[item.competitor_id] = item
                            }else{
                                for(let j = 0;j<dest.length;j++){
                                    let dj = dest[j];
                                    if(dj.competitor_id==item.competitor_id){
                                        dj.all_grade_2.push(item.grade)
                                        break;
                                    }
                                }
                            }
                        })
                        if(this.take_out==1){
                            dest.forEach((item,index)=>{
                                item.all_grade_2.pop()
                                item.all_grade_2.shift()
                            })
                        }
                        this.ope_grade_ranking = dest
                        this.ope_grade_ranking.forEach((item,index)=>{
                            let total_grade = 0;
                            let all_grade = '';
                            let ave_grade = 0;
                            item.all_grade_2.forEach((item2)=>{
                                total_grade += Number(item2)
                                all_grade += item2+','
                            })
                            if(all_grade == ''){
                                all_grade = '无'
                            }
                            item.total_grade = total_grade
                            item.all_grade = all_grade;
                            ave_grade = (total_grade / (item.all_grade_2.length)).toFixed(2)
                            if(ave_grade == 'NaN'){
                                ave_grade = '无'
                            }
                            item.ave_grade = ave_grade
                        })
                        this.ope_grade_ranking.sort(this.compare('ave_grade'))
                    })
                    .catch(err=>{
                        return this.$message.error(`系统错误，请联系管理员或稍后重试`)
                    })
            },//获取名次
            compare(prop){
                return (obj1,obj2)=>{
                    let val1 = obj1[prop];
                    let val2 = obj2[prop];
                    return val2-val1
                }
            },//排序数组
            exportToExcel() {
                let title='';
               title = this.contest_value[0]
                let tHeader = [];
               let filterVal = [];
               let list = [];
               if(this.Excel_list==null){
                   return this.$message.info(`所选数据为空`)
               }else{
                   list = this.Excel_list;
               }
               if(this.contest_value[1]=='judge'){
                   tHeader = ['id','比赛编号','评委','创建时间','备注']
                   filterVal = ['id','contest_number','name','create_time','comment']
                   title+='评委列表'
               }else if(this.contest_value[1]=='competitor'){
                   tHeader = ['id','比赛编号','选手','学院','班级','创建时间']
                   filterVal = ['id','contest_number','name','academy','class','create_time']
                   title+='选手列表'
               }else if(this.contest_value[1]=='grade'){
                   tHeader = ['id','比赛编号','选手id','选手名称','评委id','评委名称','选项','成绩']
                   filterVal = ['id','contest_number','competitor_id','name','judge_id','judge_name','contest_content','grade']
                   title+='成绩列表'
               }else if(this.contest_value[1]=='ranking'){
                   return this.$message.info(`请在《名次排行》中导出`)
               }
                //excel数据导出
                require.ensure([], () => {
                    const {
                        export_json_to_excel
                    } = require('../../vendor/Export2Excel');
                    const data = this.formatJson(filterVal, list);
                    export_json_to_excel(tHeader, data, title);
                })
            },//导出excel
            exportToExcel_ranking(){
                let title =this.checked_contest_number+'名次排行'
                let tHeader = [];
                let filterVal = [];
                let list = [];
                tHeader = ['选手id','选手名称','所以成绩','总分','平均分']
                filterVal = ['competitor_id','competitor_name','all_grade','total_grade','ave_grade']
                if(this.ope_grade_ranking[0]){
                    list = this.ope_grade_ranking
                }else{
                    return this.$message.info(`所选数据为空`)
                }
                //excel数据导出
                require.ensure([], () => {
                    const {
                        export_json_to_excel
                    } = require('../../vendor/Export2Excel');
                    const data = this.formatJson(filterVal, list);
                    export_json_to_excel(tHeader, data, title);
                })

            },//导出名次排行excel
            formatJson(filterVal, jsonData) {
                return jsonData.map(v => filterVal.map(j => v[j]))
            },
            handleChange(value){
                let contest_number = this.contest_value[0];
                let option = this.contest_value[1];
                if(option=='judge'){
                    this.$axios.get('/get_judge_excel?contest_number='+contest_number)
                        .then(res=>{
                            if(res.data.err_code==500){
                                return this.$message.error(`服务器错误，请联系管理员或稍后重试`)
                            }
                            this.Excel_list = res.data.judge
                        })
                        .catch(err=>{
                            return this.$message.error(`系统错误，请联系管理员或稍后重试`)
                        })
                }else if(option=='competitor'){
                    this.$axios.get('/get_competitor_excel?contest_number='+contest_number)
                        .then(res=>{
                            if(res.data.err_code==500){
                                return this.$message.error(`服务器错误，请联系管理员或稍后重试`)
                            }
                            this.Excel_list = res.data.competitor
                        })
                        .catch(err=>{
                            return this.$message.error(`系统错误，请联系管理员或稍后重试`)
                        })
                }else if(option=='grade'){
                    this.$axios.get('/get_grade_excel?contest_number='+contest_number)
                        .then(res=>{
                            if(res.data.err_code==500){
                                return this.$message.error(`服务器错误，请联系管理员或稍后重试`)
                            }
                            this.Excel_list = res.data.grade
                        })
                        .catch(err=>{
                            return this.$message.error(`系统错误，请联系管理员或稍后重试`)
                        })
                }
            },
            clear_contest_value(){
                this.contest_value = []
            }
        },
        created() {
            this.get_contest_list()
            this.get_grade_list();
            this.get_ope_grade();
        }
    }
</script>

<style scoped>

</style>