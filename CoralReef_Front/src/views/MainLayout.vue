<template>
    <div id="app" class="main-layout">
        <el-row>
            <el-col :span="4" v-if="!isAdminRoute">
                <div class="sidebar-container">
                    <div class="sidebar-header">
                        <div class="logo">
                            <img src="../assets/pictures/tongji.png" alt="Logo">
                            <span>珊瑚礁系统</span>
                        </div>
                    </div>
                    <el-menu default-active="1" class="el-menu-vertical-demo custom-menu" @select="handleMenuSelect"
                        background-color="#303030" text-color="#fff" active-text-color="#409EFF">
                        <el-menu-item index="1" class="custom-menu-item">
                            <el-icon>
                                <HomeFilled />
                            </el-icon>
                            <span>单次上传</span>
                        </el-menu-item>
                        <el-menu-item index="2" class="custom-menu-item">
                            <el-icon>
                                <PictureFilled />
                            </el-icon>
                            <span>批量上传</span>
                        </el-menu-item>
                        <el-menu-item index="3" class="custom-menu-item">
                            <el-icon>
                                <StarFilled />
                            </el-icon>
                            <span>结果展示</span>
                        </el-menu-item>
                        <el-menu-item index="4" class="custom-menu-item">
                            <el-icon>
                                <UserFilled />
                            </el-icon>
                            <span>个人信息</span>
                        </el-menu-item>
                    </el-menu>
                </div>
            </el-col>
            <el-col :span="isAdminRoute ? 24 : 20">
                <div class="content-area">
                    <div class="header-bar">
                        <div class="page-title">珊瑚礁白化智能识别系统</div>
                        <div class="header-actions">
                            <el-dropdown @command="handleCommand">
                                <span class="user-dropdown">
                                    <el-icon class="user-icon">
                                        <User />
                                    </el-icon>
                                    <i class="el-icon-arrow-down"></i>
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                                        <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                    </div>
                    <div class="main-content">
                        <router-view></router-view>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import {
    User,
    HomeFilled,
    PictureFilled,
    StarFilled,
    UserFilled
} from '@element-plus/icons-vue';

export default {
    name: 'App',
    components: {
        User,
        HomeFilled,
        PictureFilled,
        StarFilled,
        UserFilled
    },
    computed: {
        isAdminRoute() {
            // return this.$route.path === '/app/admin';
            return false; // 让任何页面都显示侧边栏
        }
    },
    methods: {
        handleMenuSelect(index) {
            switch (index) {
                case '1':
                    this.$router.push('/app/home');
                    break;
                case '2':
                    this.$router.push('/app/other');
                    break;
                case '3':
                    this.$router.push('/app/display');
                    break;
                case '4':
                    // this.$router.push('/app/test');
                    // 根据用户名判断跳转路由
                    const username = document.cookie
                        .split('; ')
                        .find(row => row.startsWith('username='))
                        ?.split('=')[1];

                    if (username === 'root') {
                        this.$router.push('/app/admin');
                    } else {
                        this.$router.push('/app/test');
                    }
                    break;
                default:
                    break;
            }
        },

        handleCommand(command) {
            if (command === 'profile') {
                // this.$router.push('/app/test');
                // 根据用户名判断跳转路由
                const username = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('username='))
                    ?.split('=')[1];

                if (username === 'root') {
                    this.$router.push('/app/admin');
                } else {
                    this.$router.push('/app/test');
                }
            } else if (command === 'logout') {
                this.logout();
            }
        },

        async logout() {
            try {
                await fetch('http://localhost:8080/api/logout', {
                    method: 'POST',
                    credentials: 'include',
                });
                window.location.href = 'http://localhost:5173/';
            } catch (error) {
                console.error('退出登录失败:', error);
                window.location.href = 'http://localhost:5173/';
            }
        }
    },
};
</script>

<style>
.main-layout {
    font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
    height: 100vh;
    background-color: #f5f7fa;
}

.el-row {
    margin: 0;
    height: 100%;
}

/* 侧边栏容器样式 */
.sidebar-container {
    background-color: #1e1e2d;
    color: white;
    height: 100%;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

/* 侧边栏顶部Logo区域 */
.sidebar-header {
    padding: 20px 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo {
    display: flex;
    align-items: center;
}

.logo img {
    width: 32px;
    height: 32px;
    margin-right: 10px;
    border-radius: 50%;
}

.logo span {
    font-size: 16px;
    font-weight: 600;
    color: white;
    letter-spacing: 0.5px;
}

/* 自定义菜单样式 */
.custom-menu {
    border-right: none;
    margin-top: 20px;
    background-color: transparent;
}

.custom-menu-item {
    margin: 8px 12px;
    height: 50px;
    line-height: 50px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s;
}

.custom-menu-item:hover {
    background-color: rgba(64, 158, 255, 0.08) !important;
}

.custom-menu-item .el-icon {
    margin-right: 12px;
    font-size: 18px;
    color: #8a98ac;
}

.custom-menu-item.is-active {
    background-color: rgba(64, 158, 255, 0.15) !important;
}

.custom-menu-item.is-active .el-icon {
    color: #409EFF;
}

/* 覆盖Element UI的默认样式 */
.el-menu-item.is-active {
    color: #409EFF !important;
    font-weight: 600;
}

/* 内容区域样式 */
.content-area {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.header-bar {
    height: 64px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.page-title {
    font-size: 18px;
    font-weight: 600;
    color: #1e1e2d;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.search-input {
    width: 240px;
}

.search-input .el-input__inner {
    border-radius: 20px;
}

.user-dropdown {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 2px 8px;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.user-dropdown:focus,
.user-dropdown:active {
    outline: none;
    /* 移除点击时的边框 */
}

.user-icon {
    font-size: 20px;
    color: #606266;
}

.user-icon {
    font-size: 28px;
    /* 增大图标 */
    color: #606266;
    background-color: #f2f6fc;
    border-radius: 50%;
    padding: 8px;
    /* 调整内边距，使其更圆 */
    display: flex;
    align-items: center;
    justify-content: center;
}


.main-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    background-color: #f5f7fa;
}

/* 添加 admin 路由下的特殊样式 */
.main-layout .content-area {
    transition: all 0.3s ease;
}
</style>