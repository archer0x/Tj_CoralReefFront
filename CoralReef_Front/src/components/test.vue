<template>
  <div class="page-background">
    <div class="user-profile-page">
      <!-- 用户个人信息卡片 -->
      <div class="profile-section">
        <div class="section-header">
          <h2>个人信息</h2>
          <p>查看和修改您的个人资料</p>
        </div>

        <el-form :model="userForm" ref="userFormRef" :rules="userRules" label-width="80px" class="user-form">
          <div class="user-info-layout">
            <!-- 修改头像部分的代码 -->
            <div class="avatar-container">
              <el-avatar :size="100" :src="userForm.avatar || defaultAvatar" class="user-avatar" />
              <el-button type="primary" size="small" class="change-avatar-btn" @click="showAvatarSelector">
                更换头像
              </el-button>
            </div>

            <!-- 添加头像选择对话框 -->
            <el-dialog v-model="avatarDialogVisible" title="选择头像" width="500px" center>
              <div class="avatar-selector">
                <div v-for="(avatar, index) in avatarOptions" :key="index" class="avatar-option"
                  :class="{ 'selected': selectedAvatarIndex === index }" @click="selectAvatar(index)">
                  <el-avatar :size="60" :src="avatar" />
                </div>
              </div>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="avatarDialogVisible = false">取消</el-button>
                  <el-button type="primary" @click="confirmAvatarChange">确定</el-button>
                </span>
              </template>
            </el-dialog>

            <div class="form-fields">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="userForm.username" placeholder="请输入用户名"></el-input>
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-input v-model="userForm.email" placeholder="请输入邮箱"></el-input>
              </el-form-item>

              <el-form-item label="电话" prop="phone">
                <el-input v-model="userForm.phone" placeholder="请输入电话"></el-input>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="saveUserInfo" :loading="saving">保存信息</el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <!-- 修改密码卡片 -->
      <div class="password-section">
        <div class="section-header">
          <h2>修改密码</h2>
          <p>定期修改密码可以提高账户安全性</p>
        </div>

        <el-form :model="passwordForm" ref="passwordFormRef" :rules="passwordRules" label-width="100px"
          class="password-form">
          <el-form-item label="当前密码" prop="currentPassword">
            <el-input v-model="passwordForm.currentPassword" type="password" placeholder="请输入当前密码"
              show-password></el-input>
          </el-form-item>

          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password></el-input>
          </el-form-item>

          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码"
              show-password></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="changePassword" :loading="changingPwd">修改密码</el-button>
            <el-button @click="resetPasswordForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 用户相关图片 -->
      <div class="user-images-section">
        <div class="section-header">
          <h2>我的图片</h2>
          <p>查看和管理与您相关的图片</p>
        </div>

        <!-- <div class="image-filter">
          <el-input
            v-model="imageSearchText"
            placeholder="搜索图片"
            prefix-icon="el-icon-search"
            clearable
            @input="searchImages"
            class="image-search"
          ></el-input>
        </div> -->

        <div v-if="loading" class="loading-container">
          <el-icon class="loading-icon">
            <Loading />
          </el-icon>
          <span>加载中...</span>
        </div>

        <div v-else-if="userImages.length === 0" class="empty-images">
          <el-icon>
            <Picture />
          </el-icon>
          <span>暂无图片</span>
        </div>

        <el-row :gutter="24" v-else>
          <el-col v-for="image in userImages" :key="image.id" :xs="24" :sm="12" :md="8" :lg="6">
            <div class="image-card">
              <div class="image-container">
                <img :src="image.url" class="image-preview" @click="showImageDetails(image)" />
                <div class="image-actions">
                  <el-button type="danger" circle size="small" @click="confirmDeleteImage(image)" class="delete-btn">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </div>
              </div>
              <div class="image-info">
                <h4 class="image-title">{{ image.name }}</h4>
                <span class="image-date">{{ image.date }}</span>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 图片删除确认对话框 -->
        <el-dialog v-model="deleteDialogVisible" title="确认删除" width="30%" center>
          <span>确定要删除这张图片吗？此操作不可恢复。</span>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="deleteDialogVisible = false">取消</el-button>
              <el-button type="danger" @click="deleteImage" :loading="deleting">删除</el-button>
            </span>
          </template>
        </el-dialog>

        <!-- 图片详情对话框 -->
        <el-dialog v-model="imageDetailsVisible" title="图片详情" width="60%" class="image-details-dialog">
          <div class="image-details-content">
            <div class="details-image-container">
              <img :src="selectedImage?.url" class="details-image" />
            </div>
            <div class="details-info">
              <div class="detail-item">
                <span class="detail-label">名称:</span>
                <span class="detail-value">{{ selectedImage?.name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">上传日期:</span>
                <span class="detail-value">{{ selectedImage?.time }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">分类:</span>
                <span class="detail-value">
                  <el-tag :type="selectedImage?.status === 'bleached' ? 'danger' : 'success'">
                    {{ selectedImage?.status === 'bleached' ? '白化' : '健康' }}
                  </el-tag>
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">描述:</span>
                <span class="detail-value">{{ selectedImage?.data || '暂无描述' }}</span>
              </div>
            </div>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Loading, Picture, Delete } from '@element-plus/icons-vue';
import api from '@/utils/api';

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 表单引用
const userFormRef = ref(null);
const passwordFormRef = ref(null);
const avatarInput = ref(null);

// 加载状态
const loading = ref(false);
const saving = ref(false);
const changingPwd = ref(false);
const deleting = ref(false);

// 用户信息表单
const userForm = reactive({
  username: '',
  email: '',
  phone: '',
  avatar: ''
});

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 图片相关
const userImages = ref([]);
const imageSearchText = ref('');
const selectedImage = ref(null);
const selectedImageForDelete = ref(null);
const imageDetailsVisible = ref(false);
const deleteDialogVisible = ref(false);

// 添加用户完整信息对象
const userData = ref({
  id: '',
  username: '',
  password: '',
  email: '',
  phone: '',
  enabled: 1,
  createTime: null,
  updateTime: null,
  delFlag: 0
});

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

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 3, message: '密码长度不能小于3个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 初始化加载用户信息
const fetchUserInfo = async () => {
  try {
    // 从 cookie 获取当前用户名
    const username = document.cookie
      .split('; ')
      .find(row => row.startsWith('username='))
      ?.split('=')[1];

    if (!username) {
      ElMessage.error('无法获取当前用户信息');
      return;
    }

    // 使用新接口获取用户信息
    const response = await api.get(`/users/findOne/${username}`);

    // 检查响应结构
    if (response.data && response.data.data) {
      // 保存完整的用户数据
      userData.value = response.data.data;

      // 填充表单显示数据
      userForm.username = userData.value.username;
      userForm.email = userData.value.email || '';
      userForm.phone = userData.value.phone || '';

      // 头像暂时使用默认头像或从其他地方获取
      userForm.avatar = userData.value.avatar || defaultAvatar;

      console.log('获取到的用户信息:', userData.value);
    } else {
      ElMessage.warning('获取用户信息格式不正确');
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败');
    console.error('获取用户信息失败:', error);
  }
};

// 加载用户相关图片
const fetchUserImages = async () => {
  loading.value = true;
  try {
    // 模拟API请求: GET /api/user/images?username=xxx
    const response = await api.get(`/api/data/get_photo`);
    userImages.value = response.data.map(img => ({
      ...img,
      url: img.url || img.data // 兼容不同的API返回格式
    }));
  } catch (error) {
    ElMessage.error('获取图片失败');
    console.error('获取图片失败:', error);
  } finally {
    loading.value = false;
  }
};

// 保存用户信息
const saveUserInfo = async () => {
  userFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true;
      try {
        // 同步表单数据到完整用户对象
        userData.value.username = userForm.username;
        userData.value.email = userForm.email;
        userData.value.phone = userForm.phone;

        // 使用与 admin.vue 中相同的方式发送完整用户对象
        await api.post('/users/updateOne', userData.value);

        ElMessage.success('个人信息更新成功');
      } catch (error) {
        ElMessage.error('更新失败，请重试');
        console.error('更新用户信息失败:', error);
      } finally {
        saving.value = false;
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  userFormRef.value.resetFields();
  fetchUserInfo(); // 重新获取原始数据
};

// 修改密码
const changePassword = async () => {
  passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      changingPwd.value = true;
      try {
        // 保存原始密码用于恢复
        const originalPassword = userData.value.password;

        // 更新密码字段
        userData.value.password = passwordForm.newPassword;

        // 使用与个人信息相同的接口更新，添加当前密码验证
        await api.post('/users/updateOne', {
          ...userData.value,
          // oldPassword: passwordForm.currentPassword
        });

        ElMessage.success('密码修改成功');
        resetPasswordForm();
      } catch (error) {
        ElMessage.error('密码修改失败，请检查当前密码是否正确');
        console.error('密码修改失败:', error);

        // 恢复原密码字段
        userData.value.password = originalPassword;
      } finally {
        changingPwd.value = false;
      }
    }
  });
};

// 重置密码表单
const resetPasswordForm = () => {
  passwordFormRef.value.resetFields();
};

// 预设头像选项
const avatarOptions = [
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  'https://avatars.githubusercontent.com/u/10731096',
  'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
  'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
  'https://img.yzcdn.cn/vant/cat.jpeg',
  'https://randomuser.me/api/portraits/men/1.jpg'
];

// 头像选择对话框状态
const avatarDialogVisible = ref(false);
const selectedAvatarIndex = ref(-1);
const tempSelectedAvatar = ref('');

// 显示头像选择器
const showAvatarSelector = () => {
  // 找到当前头像在选项中的索引，如果有的话
  const currentIndex = avatarOptions.findIndex(avatar => avatar === userForm.avatar);
  selectedAvatarIndex.value = currentIndex >= 0 ? currentIndex : -1;
  tempSelectedAvatar.value = userForm.avatar;
  avatarDialogVisible.value = true;
};

// 选择头像
const selectAvatar = (index) => {
  selectedAvatarIndex.value = index;
  tempSelectedAvatar.value = avatarOptions[index];
};

// 确认头像修改
const confirmAvatarChange = () => {
  if (selectedAvatarIndex.value >= 0) {
    userForm.avatar = avatarOptions[selectedAvatarIndex.value];
    // 在实际应用中，可能需要将头像选择同步到用户数据
    userData.value.avatar = userForm.avatar;

    // 如果需要，也可以保存到服务器，但这里我们只做前端效果
    ElMessage.success('头像更新成功');
  }
  avatarDialogVisible.value = false;
};

// 查看图片详情
const showImageDetails = (image) => {
  selectedImage.value = image;
  imageDetailsVisible.value = true;
};

// 确认删除图片
const confirmDeleteImage = (image) => {
  selectedImageForDelete.value = image;
  deleteDialogVisible.value = true;
};

// 删除图片 - 修改为根据图片名称删除
const deleteImage = async () => {
  if (!selectedImageForDelete.value) return;

  deleting.value = true;
  try {
    // 使用正确的API参数格式
    await api.delete('/api/data/delete_photo', {
      params: { photoname: selectedImageForDelete.value.name }
    });

    // 从列表中移除
    userImages.value = userImages.value.filter(img => img.name !== selectedImageForDelete.value.name);

    ElMessage.success('图片删除成功');
    deleteDialogVisible.value = false;
  } catch (error) {
    ElMessage.error('删除图片失败');
    console.error('删除图片失败:', error);
  } finally {
    deleting.value = false;
  }
};

// 组件挂载时执行
onMounted(() => {
  // 获取用户信息
  fetchUserInfo();

  // 获取用户相关图片
  nextTick(() => {
    fetchUserImages();
  });
});
</script>

<style scoped>
.page-background {
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  min-height: 100vh;
  position: relative;
}

.user-profile-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* 通用卡片样式 */
.profile-section,
.password-section,
.user-images-section {
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

/* 用户信息布局 */
.user-info-layout {
  display: flex;
  gap: 32px;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-fields {
  flex: 1;
}

/* 表单样式 */
.user-form,
.password-form {
  max-width: 800px;
}

.user-form :deep(.el-form-item__label),
.password-form :deep(.el-form-item__label) {
  font-weight: 500;
}

/* 图片列表样式 */
/* .image-filter {
  margin-bottom: 24px;
} */

.image-search {
  max-width: 400px;
}

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

.image-date {
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

/* 在 style 部分添加以下内容 */

/* 头像选择器样式 */
.avatar-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  margin: 10px 0;
}

.avatar-option {
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s;
}

.avatar-option:hover {
  background-color: #f5f7fa;
  transform: translateY(-3px);
}

.avatar-option.selected {
  background-color: #ecf5ff;
  border: 2px solid #409EFF;
}

.avatar-option .el-avatar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .user-info-layout {
    flex-direction: column;
  }

  .avatar-container {
    margin-bottom: 24px;
  }

  .image-details-content {
    flex-direction: column;
  }

  .details-image-container {
    margin-bottom: 16px;
  }
}
</style>