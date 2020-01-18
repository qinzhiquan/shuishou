<template>

    <el-container class="home-container">
        <!--头部区域-->
        <el-header>
            <div>
                <img style="height: 50px;border-radius: 50%" src='../assets/shuishou.png'>
                <span>水手评分系统</span>
            </div>

            <el-button type="info" @click="logout">退出登录</el-button>
        </el-header>
        <!--主体区域-->
        <el-container>
            <!--主体左侧区域-->
            <el-aside :width="isCollapse?'64px':'200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!--侧边栏菜单区域-->
                <el-menu
                        :default-active="activePath"
                        :router="true"
                        :collapse-transition="false"
                        :collapse="isCollapse"
                        :unique-opened="false"
                        background-color="#333744"
                        text-color="#fff"
                        active-text-color="#0000ff">
                    <!--一级菜单-->
                    <el-submenu :index="item.id + ''" v-for="item in menuslist" :key="item.id">
                        <!--一级菜单模板区域-->
                        <template slot="title">
                            <!--图标-->
                            <i :class="iconObj[item.id]"></i>
                            <!--文本-->
                            <span>{{item.authName}}</span>
                        </template>
                        <!--二级菜单-->
                        <el-menu-item v-for="subItem in item.children" :key="subItem.id" :index="'/'+subItem.path">
                            <template slot="title">
                                <!--图标-->
                                <i class="el-icon-menu"></i>
                                <!--文本-->
                                <span @click="saveNavState('/'+subItem.path)">{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>

                </el-menu>
            </el-aside>
            <!--主体右侧区域-->
            <el-main><router-view></router-view></el-main>
        </el-container>
    </el-container>
</template>

<script>
    export default {
        name: "Home",
        data(){
            return {
                menuslist:'',
                iconObj:{
                    '1':'el-icon-user',
                    '2':'el-icon-help',
                    '3':'el-icon-bell',
                    '4':'el-icon-position',
                    '5':'el-icon-key'
                },
                isCollapse:false,
                activePath:''
            }
        },
        methods:{
            logout(){
                window.sessionStorage.clear();
                this.$router.push('/login');
            },
            getMenuList(){
                this.$axios.get('/menus')
                    .then(res=>{
                        if(res.data){
                            this.menuslist = res.data
                        }else{

                        }
                    })
                    .catch(err=>{
                        console.log(err)
                    })
            },//获取菜单列表
            toggleCollapse(){
                this.isCollapse = ! this.isCollapse
            },//菜单按钮折贴散开
            saveNavState(activePath){
                window.sessionStorage.setItem('activePath',activePath);
                this.activePath = activePath
            },//保存当前点击菜单

        },
        created() {
            this.getMenuList();
            this.activePath = window.sessionStorage.getItem('activePath');
        },
        beforeDestroy() {
        }
    }
</script>

<style xml:lang="less" scoped>
    .el-container{
        height: 100%;
    }
    .el-header{
        background-color: lightskyblue;
        display: flex;
        justify-content: space-between;
        padding-left: 0;
        align-items: center;
        color:#000000;
        font-size:20px;
    }
    .el-header div{
        display: flex;
        align-items: center;
    }
    .el-header div span{
        margin-left: 15px;
    }
    .el-aside{
        background-color: #333744;
    }
    .el-aside .el-menu{
        border-right: none;
    }
    .el-main{
        background-color: #eaedf1;
    }
    .toggle-button{
        background-color: #4a5064;
        font-size: 10px;
        line-height: 24px;
        color: white;
        text-align: center;
        letter-spacing: 0.2em;
        cursor: pointer;
    }
</style>