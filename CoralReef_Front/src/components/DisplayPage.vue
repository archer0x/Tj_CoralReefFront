<template>
  <div class="display-page">
    <!-- 搜索和筛选区域 -->
    <div class="filter-section">
      <div class="search-box">
        <el-input 
          v-model="filterText" 
          placeholder="输入关键词进行筛选" 
          @input="filterImages"
          class="filter-input"
          prefix-icon="el-icon-search"
        />
      </div>

      <!-- 时间筛选和种类选择放在同一行 -->
      <div class="filter-controls">
        <el-form inline class="filter-form">
          <el-form-item label="选择日期:" class="custom-form-item">
            <el-date-picker
              v-model="selectedDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              @change="filterImages"
              class="custom-date-picker"
            />
          </el-form-item>

          <!-- 图片种类切换 -->
          <el-form-item label="选择图片种类:" class="custom-form-item">
            <el-select 
              v-model="selectedType" 
              placeholder="选择种类" 
              @change="filterImages"
              class="custom-select"
            >
              <el-option label="所有" value="all"></el-option>
              <el-option label="白化珊瑚" value="bleached"></el-option>
              <el-option label="健康珊瑚" value="unbleached"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 图片展示区域 -->
    <div class="gallery-section">
      <div v-for="(images, month) in filteredGroupedImages" :key="month" class="month-group">
        <h3 class="month-title">{{ month }}</h3>
        <el-row :gutter="24">
          <el-col v-for="image in images" :key="image.id" :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
            <div class="image-card">
              <div class="image-container">
                <img :src="image.url" class="gallery-image" @click="showImageDetails(image)" />
              </div>
              <div class="image-info">
                <h4 class="image-description">{{ image.description }}</h4>
                <div class="image-meta">
                  <span class="image-date">{{ image.date }}</span>
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="showImageDetails(image)"
                    class="details-button"
                  >查看详情</el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 图片详情对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="图片详情" 
      width="60%" 
      class="custom-dialog"
    >
      <div class="image-details">
        <div class="details-image-container">
          <img :src="selectedImage?.url" class="details-image" />
        </div>
        <div class="details-content">
          <div class="detail-item">
            <span class="detail-label">描述:</span>
            <span class="detail-value">{{ selectedImage?.description }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">日期:</span>
            <span class="detail-value">{{ selectedImage?.date }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">种类:</span>
            <span class="detail-value">{{ selectedImage?.type }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/utils/api'; // 引入 api.js
import { ElRow, ElCol, ElCard, ElTag, ElDialog, ElForm, ElFormItem, ElDatePicker, ElSelect, ElOption } from 'element-plus';

export default {
  components: {
    ElRow,
    ElCol,
    ElCard,
    ElTag,
    ElDialog,
    ElForm,
    ElFormItem,
    ElDatePicker,
    ElSelect,
    ElOption,
  },
  data() {
    return {
      images: [], // 初始为空，数据从接口获取
      selectedDate: '',
      selectedType: 'all',
      groupedImages: {},
      filteredGroupedImages: {},
      selectedImage: null,
      dialogVisible: false,
      filterText: '',
    };
  },
  methods: {
    async fetchImages() {
      try {
        const response = await api.get('/api/data/get_photo');
        this.images = response.data.map(item => ({
          id: item.id,
          url: item.data,
          description: item.name,
          date: item.time.split(' ')[0], // 提取日期部分
          type: item.status, // 使用 status 作为种类
        }));

        this.groupImagesByMonth();
      } catch (error) {
        console.error('获取图片数据失败:', error);
      }
    },
    filterImages() {
      const filteredImages = this.images.filter(image => {
        const matchesDate = this.selectedDate ? image.date === this.selectedDate : true;
        const matchesType = this.selectedType === 'all' ? true : image.type === this.selectedType;
        const matchesKeyword = this.filterText ? image.description.toLowerCase().includes(this.filterText.toLowerCase()) : true;
        return matchesDate && matchesType && matchesKeyword;
      });

      this.filteredGroupedImages = filteredImages.reduce((groups, image) => {
        const month = image.date.slice(0, 7); // 提取年月
        if (!groups[month]) {
          groups[month] = [];
        }
        groups[month].push(image);
        return groups;
      }, {});
    },
    showImageDetails(image) {
      this.selectedImage = image;
      this.dialogVisible = true;
    },
    groupImagesByMonth() {
      this.groupedImages = this.images.reduce((groups, image) => {
        const month = image.date.slice(0, 7);
        if (!groups[month]) {
          groups[month] = [];
        }
        groups[month].push(image);
        return groups;
      }, {});
      this.filteredGroupedImages = this.groupedImages;
    },
  },
  mounted() {
    this.fetchImages(); // 组件挂载时获取数据
  },
};
</script>

<style scoped>
.display-page {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 24px;
}

/* 筛选区域样式 */
.filter-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.search-box {
  margin-bottom: 20px;
}

.filter-input {
  width: 100%;
}

.filter-input :deep(.el-input__inner) {
  border-radius: 4px;
  height: 40px;
  font-size: 14px;
}

/* 新增的筛选控件容器 */
.filter-controls {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

/* 修改表单布局为一行 */
.filter-form {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.custom-form-item {
  margin-bottom: 0;
  margin-right: 24px; /* 增加间距 */
}

.custom-form-item:last-child {
  margin-right: 0;
}

.custom-form-item :deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.custom-date-picker, .custom-select {
  width: 220px;
}

.custom-date-picker :deep(.el-input__inner),
.custom-select :deep(.el-input__inner) {
  border-radius: 4px;
  height: 40px;
}

/* 确保在小屏幕上仍然可用 */
@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .custom-form-item {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .custom-date-picker, .custom-select {
    width: 100%;
  }
}

/* 图片展示区域样式 */
.gallery-section {
  margin-top: 24px;
}

.month-group {
  margin-bottom: 32px;
}

.month-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.image-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  margin-bottom: 24px;
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.1);
}

.image-container {
  height: 200px;
  overflow: hidden;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
  cursor: pointer;
}

.gallery-image:hover {
  transform: scale(1.05);
}

.image-info {
  padding: 16px;
}

.image-description {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-date {
  font-size: 13px;
  color: #909399;
}

.details-button {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 4px;
}

/* 对话框样式 */
.custom-dialog :deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

.custom-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
}

.custom-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.image-details {
  display: flex;
  gap: 24px;
}

.details-image-container {
  flex: 3;
  border-radius: 4px;
  overflow: hidden;
}

.details-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.details-content {
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
</style>