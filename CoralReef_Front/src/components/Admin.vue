<template>
    <div class="page-background">
        <div class="admin-page">
            <!-- 用户管理部分 -->
            <div class="section user-management-section">
                <div class="section-header">
                    <h2>用户管理</h2>
                    <p>查看和管理所有用户信息</p>
                </div>

                <el-table :data="users" v-loading="loadingUsers" style="width: 100%">
                    <el-table-column prop="username" label="用户名" />
                    <el-table-column prop="email" label="邮箱" />
                    <el-table-column prop="phone" label="电话" />
                    <el-table-column prop="createTime" label="创建时间">
                        <template #default="scope">
                            {{ formatDate(scope.row.createTime) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="enabled" label="状态">
                        <template #default="scope">
                            <el-tag :type="scope.row.enabled ? 'success' : 'danger'">
                                {{ scope.row.enabled ? '启用' : '禁用' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200">
                        <template #default="scope">
                            <el-button type="primary" size="small" @click="editUser(scope.row)">编辑</el-button>
                            <el-button type="danger" size="small" @click="confirmDeleteUser(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 图片管理部分 -->
            <div class="section image-management-section">
                <div class="section-header">
                    <h2>图片管理</h2>
                    <p>查看和管理所有用户上传的图片</p>
                </div>

                <div v-if="loadingImages" class="loading-container">
                    <el-icon class="loading-icon">
                        <Loading />
                    </el-icon>
                    <span>加载中...</span>
                </div>

                <div v-else-if="images.length === 0" class="empty-images">
                    <el-icon>
                        <Picture />
                    </el-icon>
                    <span>暂无图片</span>
                </div>

                <el-row :gutter="24" v-else>
                    <el-col v-for="image in images" :key="image.id" :xs="24" :sm="12" :md="8" :lg="6">
                        <div class="image-card">
                            <div class="image-container">
                                <img :src="image.data" class="image-preview" @click="showImageDetails(image)" />
                                <div class="image-actions">
                                    <el-button type="danger" circle size="small" @click="confirmDeleteImage(image)"
                                        class="delete-btn">
                                        <el-icon>
                                            <Delete />
                                        </el-icon>
                                    </el-button>
                                </div>
                            </div>
                            <div class="image-info">
                                <h4 class="image-title">{{ image.name }}</h4>
                                <div class="image-meta">
                                    <span class="image-date">{{ image.time }}</span>
                                    <span class="image-user">上传者: {{ image.username }}</span>
                                </div>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>

            <!-- 用户编辑对话框 -->
            <el-dialog v-model="userDialogVisible" :title="editingUser.id ? '编辑用户' : '新增用户'" width="500px">
                <el-form :model="editingUser" ref="userFormRef" :rules="userRules" label-width="80px">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="editingUser.username" :disabled="!!editingUser.id"></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="editingUser.email"></el-input>
                    </el-form-item>
                    <el-form-item label="电话" prop="phone">
                        <el-input v-model="editingUser.phone"></el-input>
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-switch v-model="editingUser.enabled" :active-value="1" :inactive-value="0" />
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="userDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="saveUser" :loading="saving">
                            确定
                        </el-button>
                    </span>
                </template>
            </el-dialog>

            <!-- 图片详情对话框 -->
            <el-dialog v-model="imageDetailsVisible" title="图片详情" width="60%">
                <div class="image-details-content">
                    <div class="details-image-container">
                        <img :src="selectedImage?.data" class="details-image" />
                    </div>
                    <div class="details-info">
                        <div class="detail-item">
                            <span class="detail-label">名称:</span>
                            <span class="detail-value">{{ selectedImage?.name }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">上传时间:</span>
                            <span class="detail-value">{{ selectedImage?.time }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">上传者:</span>
                            <span class="detail-value">{{ selectedImage?.username }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">状态:</span>
                            <span class="detail-value">
                                <el-tag :type="selectedImage?.status === 'bleached' ? 'danger' : 'success'">
                                    {{ selectedImage?.status === 'bleached' ? '白化' : '健康' }}
                                </el-tag>
                            </span>
                        </div>
                    </div>
                </div>
            </el-dialog>

            <!-- 删除确认对话框 -->
            <el-dialog v-model="deleteDialogVisible" title="确认删除" width="30%" center>
                <span>{{ deleteConfirmMessage }}</span>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="deleteDialogVisible = false">取消</el-button>
                        <el-button type="danger" @click="confirmDelete" :loading="deleting">删除</el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Loading, Picture, Delete } from '@element-plus/icons-vue';
import api from '@/utils/api';

// 数据列表
const users = ref([]);
const images = ref([]);
const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    username: '',
    email: '',
    phone: '',
    enabled: null
});

// 加载状态
const loadingUsers = ref(false);
const loadingImages = ref(false);
const saving = ref(false);
const deleting = ref(false);

// 对话框显示状态
const userDialogVisible = ref(false);
const imageDetailsVisible = ref(false);
const deleteDialogVisible = ref(false);

// 当前编辑/选中的项
const editingUser = ref({
    id: '',
    createTime: null,
    updateTime: null,
    delFlag: 0,
    username: '',
    password: '',
    email: '',
    phone: '',
    enabled: 1
});
const selectedImage = ref(null);
const deleteType = ref(''); // 'user' 或 'image'
const deleteItem = ref(null);
const deleteConfirmMessage = ref('');

// 表单验证规则
const userRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入电话号码', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ]
};

// 获取所有用户
const fetchUsers = async () => {
    loadingUsers.value = true;
    try {
        const response = await api.post('/users/findList', { queryParams });
        users.value = response.data.data.records;
        console.log(users.value);
    } catch (error) {
        ElMessage.error('获取用户列表失败');
        console.error('获取用户列表失败:', error);
    } finally {
        loadingUsers.value = false;
    }
};

// 获取所有图片
const fetchImages = async () => {
    loadingImages.value = true;
    try {
        const response = await api.get('/api/data/getAllPhoto');
        images.value = response.data;
    } catch (error) {
        ElMessage.error('获取图片列表失败');
        console.error('获取图片列表失败:', error);
    } finally {
        loadingImages.value = false;
    }
};

// 编辑用户
const editUser = (user) => {
    // 创建一个新对象，深拷贝用户数据
    editingUser.value = {
        id: user.id,
        username: user.username,
        password: user.password,
        email: user.email,
        phone: user.phone,
        enabled: user.enabled,
        createTime: user.createTime,
        updateTime: user.updateTime,
        delFlag: user.delFlag
    };
    console.log('编辑的用户信息:', editingUser.value);
    userDialogVisible.value = true;
};

// 保存用户信息
const saveUser = async () => {
    saving.value = true;
    try {
        await api.post('/users/updateOne', editingUser.value);
        ElMessage.success('保存成功');
        userDialogVisible.value = false;
        fetchUsers(); // 刷新用户列表
    } catch (error) {
        ElMessage.error('保存失败');
        console.error('保存用户信息失败:', error);
    } finally {
        saving.value = false;
    }
};

// 确认删除用户
const confirmDeleteUser = (user) => {
    deleteType.value = 'user';
    deleteItem.value = user;
    deleteConfirmMessage.value = `确定要删除用户 "${user.username}" 吗？此操作不可恢复。`;
    deleteDialogVisible.value = true;
};

// 确认删除图片
const confirmDeleteImage = (image) => {
    deleteType.value = 'image';
    deleteItem.value = image;
    deleteConfirmMessage.value = `确定要删除图片 "${image.name}" 吗？此操作不可恢复。`;
    deleteDialogVisible.value = true;
};

// 执行删除操作
const confirmDelete = async () => {
    deleting.value = true;
    try {
        if (deleteType.value === 'user') {
            await api.delete(`/users/deleteOne/${deleteItem.value.username}`);
            users.value = users.value.filter(u => u.username !== deleteItem.value.username);
        } else {
            await api.delete('/api/data/delete_photo', {
                params: { photoname: deleteItem.value.name }
            });
            images.value = images.value.filter(img => img.name !== deleteItem.value.name);
        }
        ElMessage.success('删除成功');
        deleteDialogVisible.value = false;
    } catch (error) {
        ElMessage.error('删除失败');
        console.error('删除失败:', error);
    } finally {
        deleting.value = false;
    }
};

// 查看图片详情
const showImageDetails = (image) => {
    selectedImage.value = image;
    imageDetailsVisible.value = true;
};

// 格式化日期
const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
};

// 组件挂载时执行
onMounted(() => {
    fetchUsers();
    fetchImages();
});
</script>

<style scoped>
/* 复用 test.vue 的样式并添加管理页面特定样式 */
.page-background {
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    min-height: 100vh;
    position: relative;
}

.admin-page {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
}

.section {
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
    margin-bottom: 24px;
}

.section-header h2 {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
}

.section-header p {
    font-size: 14px;
    color: #606266;
    margin: 0;
}

/* 图片卡片样式 */
.image-card {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
    transition: transform 0.3s, box-shadow 0.3s;
}

.image-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.image-container {
    height: 180px;
    position: relative;
    overflow: hidden;
}

.image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
    cursor: pointer;
}

.image-container:hover .image-preview {
    transform: scale(1.05);
}

.image-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0;
    transition: opacity 0.3s;
}

.image-container:hover .image-actions {
    opacity: 1;
}

.delete-btn {
    background-color: rgba(242, 11, 11, 0.9);
}

.image-info {
    padding: 12px;
}

.image-title {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin: 0 0 8px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.image-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #909399;
}

/* 图片详情对话框 */
.image-details-content {
    display: flex;
    gap: 24px;
}

.details-image-container {
    flex: 3;
    overflow: hidden;
    border-radius: 4px;
}

.details-image {
    width: 100%;
    max-height: 500px;
    object-fit: contain;
}

.details-info {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.detail-label {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
}

.detail-value {
    font-size: 16px;
    color: #303133;
}

/* 加载状态 */
.loading-container,
.empty-images {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: #909399;
}

.loading-icon,
.empty-images .el-icon {
    font-size: 40px;
    margin-bottom: 16px;
    opacity: 0.7;
}

.loading-icon {
    animation: spin 1.5s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* 响应式调整 */
@media (max-width: 768px) {
    .image-details-content {
        flex-direction: column;
    }

    .details-image-container {
        margin-bottom: 16px;
    }
}
</style>