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

    <!-- 在搜索和筛选区域下方添加 -->
    <div class="statistics-section">
      <el-row :gutter="24">
        <el-col :span="12">
          <div class="stat-card">
            <h3>图片分类统计</h3>
            <div class="chart-container" ref="pieChartRef"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="stat-card">
            <h3>置信度分布</h3>
            <div class="chart-container" ref="barChartRef"></div>
          </div>
        </el-col>
      </el-row>
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
import * as echarts from 'echarts/core';
import { PieChart, BarChart } from 'echarts/charts';
import { LegendComponent, TooltipComponent, TitleComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册 ECharts 组件
echarts.use([PieChart, BarChart, LegendComponent, TooltipComponent, TitleComponent, GridComponent, CanvasRenderer]);

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
      pieChart: null,
      barChart: null,
    };
  },
  methods: {
    // 获取图片数据
    async fetchImages() {
      try {
        const response = await api.get('/api/data/get_photo');
        this.images = response.data.map(item => ({
          id: item.id,
          url: item.data,
          description: item.name,
          date: item.time.split(' ')[0], // 提取日期部分
          type: item.status, // 使用 status 作为种类
          confidence: item.confidence || 0, // 添加置信度属性
        }));

        this.groupImagesByMonth();
        this.initCharts(); // 初始化图表
      } catch (error) {
        console.error('获取图片数据失败:', error);
      }
    },
    // 过滤图片
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
    // 显示图片详情
    showImageDetails(image) {
      this.selectedImage = image;
      this.dialogVisible = true;
    },
    // 按月份分组图片
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
    // 初始化所有图表
    initCharts() {
      this.$nextTick(() => {
        this.initPieChart();
        this.initBarChart();
      });
    },
    // 初始化饼图
    initPieChart() {
      const pieChartElement = this.$refs.pieChartRef;
      if (!pieChartElement) return;
      
      this.pieChart = echarts.init(pieChartElement);
      
      // 计算数据
      const bleachedCount = this.images.filter(img => img.type === 'bleached').length;
      const healthyCount = this.images.length - bleachedCount;
      
      // 计算平均置信度
      const bleachedData = this.images.filter(img => img.type === 'bleached');
      const healthyData = this.images.filter(img => img.type !== 'bleached');
      const avgBleachedConfidence = this.calculateAverage(bleachedData, 'confidence');
      const avgHealthyConfidence = this.calculateAverage(healthyData, 'confidence');
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            const confidenceInfo = params.name === '白化' ? 
              `<br/>平均置信度: ${(avgBleachedConfidence * 100).toFixed(2)}%` : 
              `<br/>平均置信度: ${(avgHealthyConfidence * 100).toFixed(2)}%`;
            return `${params.seriesName} <br/>${params.name}: ${params.value} (${params.percent}%)${confidenceInfo}`;
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        series: [
          {
            name: '珊瑚图片',
            type: 'pie',
            radius: '55%',
            center: ['50%', '50%'],
            data: [
              { value: bleachedCount, name: '白化', itemStyle: { color: '#F56C6C' } },
              { value: healthyCount, name: '健康', itemStyle: { color: '#67C23A' } }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: '{b}: {c} ({d}%)'
            }
          }
        ]
      };
      
      this.pieChart.setOption(option);
    },
    // 初始化条形图
    initBarChart() {
      const barChartElement = this.$refs.barChartRef;
      if (!barChartElement) return;
      
      this.barChart = echarts.init(barChartElement);
      
      // 将置信度分组
      const confidenceGroups = {
        '90-100%': 0,
        '80-90%': 0,
        '70-80%': 0,
        '60-70%': 0,
        '<60%': 0
      };
      
      this.images.forEach(img => {
        const confidence = parseFloat(img.confidence || 0) * 100;
        if (confidence >= 90) {
          confidenceGroups['90-100%']++;
        } else if (confidence >= 80) {
          confidenceGroups['80-90%']++;
        } else if (confidence >= 70) {
          confidenceGroups['70-80%']++;
        } else if (confidence >= 60) {
          confidenceGroups['60-70%']++;
        } else {
          confidenceGroups['<60%']++;
        }
      });
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%', // 增加底部空间以显示标签
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: Object.keys(confidenceGroups),
            axisTick: {
              alignWithLabel: true
            },
            axisLabel: {
              interval: 0, // 强制显示所有标签
              rotate: 45, // 旋转标签以防止重叠
              fontSize: 12,
              margin: 8 // 增加与轴的距离
            }
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: '图片数量',
            type: 'bar',
            barWidth: '60%',
            data: Object.values(confidenceGroups).map((value, index) => {
              // 根据置信度范围设置不同颜色
              const colors = ['#67C23A', '#85CF4E', '#E6A23C', '#F56C6C', '#909399'];
              return {
                value: value,
                itemStyle: {
                  color: colors[index]
                }
              };
            })
          }
        ]
      };
      
      this.barChart.setOption(option);
    },
    // 计算平均值
    calculateAverage(data, prop) {
      if (data.length === 0) return 0;
      const sum = data.reduce((acc, item) => acc + parseFloat(item[prop] || 0), 0);
      return sum / data.length;
    },
    // 窗口大小改变处理
    handleResize() {
      if (this.pieChart) this.pieChart.resize();
      if (this.barChart) this.barChart.resize();
    }
  },
  mounted() {
    this.fetchImages(); // 组件挂载时获取数据
    
    // 添加窗口大小改变事件
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    // 清理图表实例
    if (this.pieChart) {
      this.pieChart.dispose();
      this.pieChart = null;
    }
    if (this.barChart) {
      this.barChart.dispose();
      this.barChart = null;
    }
    
    window.removeEventListener('resize', this.handleResize);
  }
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

/* 添加图表相关样式 */
.statistics-section {
  margin-bottom: 24px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  height: 100%;
}

.stat-card h3 {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-top: 0;
  margin-bottom: 16px;
}

.chart-container {
  height: 300px;
  width: 100%;
}
</style>