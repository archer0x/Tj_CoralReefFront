<template>
  <div class="home-page">
    <div class="upload-section">
      <div class="section-header">
        <h2>图片上传</h2>
        <p>上传珊瑚照片，系统将自动进行白化识别</p>
      </div>
      
      <el-upload 
        class="custom-upload" 
        drag 
        action="http://localhost:8080/upload" 
        multiple 
        @success="handleUploadSuccess"
      >
        <div class="upload-content">
          <el-icon class="upload-icon"><upload-filled /></el-icon>
          <div class="upload-text">
            <span class="upload-main-text">拖动文件至区域内或<em>点击上传</em></span>
            <span class="upload-sub-text">支持jpg/png格式，文件大小不超过50MB</span>
          </div>
        </div>
      </el-upload>
    </div>
    
    <div class="detection-section">
      <div class="detection-header">
        <el-button type="primary" class="detection-button" @click="fetchData">
          开始检测
          <el-icon class="el-icon--right"><Upload /></el-icon>
        </el-button>
        
        <div class="progress-container">
          <el-progress 
            :percentage="progressPercentage" 
            :stroke-width="12" 
            status="success" 
            class="custom-progress"
          />
          <span class="progress-text" v-if="progressPercentage > 0">处理中... {{ progressPercentage }}%</span>
        </div>
      </div>
    </div>
    
    <div class="image-processor">
      <div class="processor-header">
        <h2>图片处理</h2>
        <p>在图片上选择区域进行局部检测</p>
      </div>
      
      <div class="controls">
        <el-button type="primary" @click="loadOriginalImage" :loading="loading">
          加载原始图片
        </el-button>
        <el-button 
          type="success" 
          @click="sendToYolo" 
          :disabled="!originalImage || loading || !hasCropSelection"
        >
          发送截取图片到YOLO
        </el-button>
        <el-button 
          type="warning" 
          @click="saveImages" 
          :loading="saving"
          class="save-button"
        >
          保存图片
        </el-button>
      </div>

      <div class="image-container">
        <div class="original-image">
          <h3>原始图片 <span class="muted-text">(点击并拖动进行截取)</span></h3>
          <div v-if="loading" class="loading-indicator">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div class="canvas-container">
            <canvas 
              ref="canvasRef" 
              @mousedown="handleMouseDown" 
              @mousemove="handleMouseMove" 
              @mouseup="handleMouseUp"
              @mouseleave="handleMouseUp"
            ></canvas>
          </div>
        </div>

        <div class="processed-image">
          <h3>YOLO处理后的图片</h3>
          <div v-if="loading" class="loading-indicator">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>处理中...</span>
          </div>
          <div class="result-container" v-if="processedImage">
            <img :src="processedImage" alt="YOLO处理后的图片" />
          </div>
          <div class="no-result" v-else-if="!loading">
            <el-icon><Picture /></el-icon>
            <span>等待处理结果...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { UploadFilled, Upload, Loading, Picture} from "@element-plus/icons-vue";
import { ElMessage } from 'element-plus';
import api from '@/utils/api'

// 状态变量
const showTable = ref(false);
const originalImage = ref(null);
const processedImage = ref(null);
const isCropping = ref(false);
const cropStart = ref({ x: 0, y: 0 });
const cropEnd = ref({ x: 0, y: 0 });
const loading = ref(false);
const imageObj = ref(null);
const originalImageName = ref(''); // 用于存储原始图片名称

const imageUrl = ref(""); // 用于存储上传后的图片路径
const progressPercentage = ref(0); //进度条响应变量
const saving = ref(false); // 新增保存状态

// DOM引用
const canvasRef = ref(null);

// 计算是否有有效的截取区域
const hasCropSelection = computed(() => {
  return cropStart.value.x !== cropEnd.value.x && cropStart.value.y !== cropEnd.value.y;
});

// 从URL提取图片名称
const extractImageName = (url) => {
  const parts = url.split('/');
  return parts[parts.length - 1];
};

const fetchData = async () => {
  try {
    // 重置进度条
    progressPercentage.value = 0;
    
   // 模拟进度增长
   const intervalId = setInterval(() => {
        // 确保进度不会超过100%
        if (progressPercentage.value < 98) {
            progressPercentage.value += 2;
        } else if (progressPercentage.value < 100) {
            progressPercentage.value = 100;
        }
        
        // 当进度达到100%时清除计时器
        if (progressPercentage.value >= 100) {
            clearInterval(intervalId);
        }
    }, 50);

    const response = await api.post("/api/yolo/single");
    console.log(response);
    processedImage.value = response.data.save_path;
    
    // 如果当前进度已经为 100%，则不再执行
    if (progressPercentage.value === 100) {
      showTable.value = true; // 显示表格
      return;
    }

  } catch (error) {
    console.error("Error fetching data from backend:", error);
  }
};

const handleUploadSuccess = (response, file, fileList) => {
  console.log(response);
  // 上传成功后，从响应数据中获取图片路径
  imageUrl.value = response.imageUrl; // 假设响应数据中的图片路径字段为"url"，根据实际情况修改
};

// 加载原始图片
const loadOriginalImage = () => {
  loading.value = true;

  // 使用静态路由的图片
  const staticImageUrl = imageUrl.value;
  originalImage.value = staticImageUrl;
  console.log(staticImageUrl);

  // 提取原始图片名称
  originalImageName.value = extractImageName(staticImageUrl);

  const img = new Image();
  img.crossOrigin = "Anonymous"; // 允许跨域图片处理
  img.src = staticImageUrl;
  img.onload = () => {
    imageObj.value = img;
    initCanvas();
    loading.value = false;
  };
  img.onerror = (error) => {
    console.error('加载图片失败:', error);
    loading.value = false;
  };
};

// 初始化画布
const initCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas || !imageObj.value) return;

  const ctx = canvas.getContext('2d');
  canvas.width = imageObj.value.width;
  canvas.height = imageObj.value.height;
  ctx.drawImage(imageObj.value, 0, 0);
};

// 监听originalImage变化，初始化画布
watch(originalImage, () => {
  if (originalImage.value) {
    initCanvas();
  }
});

// 鼠标按下事件 - 开始截取
const handleMouseDown = (e) => {
  if (!originalImage.value) return;

  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 重置截取区域
  cropStart.value = { x, y };
  cropEnd.value = { x, y };
  isCropping.value = true;
};

// 鼠标移动事件 - 更新截取区域
const handleMouseMove = (e) => {
  if (!isCropping.value || !originalImage.value) return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  cropEnd.value = { x, y };

  // 重绘图像和截取框
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imageObj.value, 0, 0);

  const width = cropEnd.value.x - cropStart.value.x;
  const height = cropEnd.value.y - cropStart.value.y;

  ctx.strokeStyle = '#409EFF';
  ctx.lineWidth = 2;
  ctx.strokeRect(cropStart.value.x, cropStart.value.y, width, height);
  
  // 添加半透明遮罩效果
  ctx.fillStyle = 'rgba(64, 158, 255, 0.2)';
  ctx.fillRect(cropStart.value.x, cropStart.value.y, width, height);
};

// 鼠标释放事件 - 完成截取
const handleMouseUp = () => {
  if (!isCropping.value) return;
  isCropping.value = false;
};

// 发送截取的图片到YOLO进行识别
const sendToYolo = async () => {
  if (!originalImage.value) return;

  try {
    loading.value = true;

    // 获取截取的图片区域
    const canvas = canvasRef.value;

    const width = Math.abs(cropEnd.value.x - cropStart.value.x);
    const height = Math.abs(cropEnd.value.y - cropStart.value.y);
    const startX = Math.min(cropStart.value.x, cropEnd.value.x);
    const startY = Math.min(cropStart.value.y, cropStart.value.y);

    // 创建新的canvas来保存截取的图片
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = width;
    cropCanvas.height = height;
    const cropCtx = cropCanvas.getContext('2d');

    // 将截取部分绘制到新的canvas上
    cropCtx.drawImage(
      canvas,
      startX, startY, width, height,
      0, 0, width, height
    );

    // 生成截取图片名称，基于原图名称
    const timestamp = new Date().getTime();
    const croppedImageName = `cropped_${timestamp}_${originalImageName.value}`;

    // 将canvas转为blob
    cropCanvas.toBlob(async (blob) => {
      // 准备上传截取的图片
      const imageFormData = new FormData();
      imageFormData.append('file', blob, croppedImageName);

      // 上传截取的图片到服务器
      const uploadResponse = await api.post('http://localhost:8080/upload', imageFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // 假设上传成功后，服务器返回了图片的保存路径
      if (uploadResponse.data && uploadResponse.data.imageUrl) {
        const imagePath = uploadResponse.data.imageUrl; // 例如: "D:/Code/backend/UploadPhoto/cropped_1234567890_test.jpg"

        // 发送图片路径给YOLO接口
        const yoloResponse = await api.post('http://localhost:8080/api/yolo/single', {
          "image_path": imagePath
        });

        // 处理YOLO返回的图片URL
        if (yoloResponse.data && yoloResponse.data.save_path) {
          // 假设YOLO返回的是相对URL，需要拼接基础URL
          processedImage.value = yoloResponse.data.save_path;
        } else {
          console.log(yoloResponse.data);
          console.error('YOLO接口未返回有效的图片URL');
        }
      } else {
        console.log(uploadResponse.data);
        console.error('图片上传失败或未返回文件路径');
      }

      loading.value = false;
    }, 'image/jpeg');

  } catch (error) {
    console.error('处理图片失败:', error);
    loading.value = false;
  }
};

// 新增保存图片功能
const saveImages = async () => {
    saving.value = true;
    try {
        // 调用保存图片接口
        await api.post('http://localhost:8080/api/data/save_photo');
        
        // 显示成功消息
        ElMessage.success('保存成功');
    } catch (error) {
        console.error('保存图片失败:', error);
        ElMessage.error('保存失败，请重试');
    } finally {
        saving.value = false;
    }
};

// 页面加载时自动加载图片
onMounted(() => {
  loadOriginalImage();
});
</script>

<style scoped>
.home-page {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 24px;
}

/* 上传区域样式 */
.upload-section {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 20px;
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

.custom-upload {
  width: 100%;
}

.custom-upload :deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  transition: all 0.3s;
}

.custom-upload :deep(.el-upload-dragger:hover) {
  border-color: #409EFF;
  background-color: rgba(64, 158, 255, 0.05);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.upload-icon {
  font-size: 40px;
  color: #409EFF;
  margin-bottom: 16px;
}

.upload-text {
  text-align: center;
}

.upload-main-text {
  font-size: 16px;
  display: block;
  margin-bottom: 8px;
  color: #303133;
}

.upload-main-text em {
  color: #409EFF;
  font-style: normal;
  font-weight: 500;
}

.upload-sub-text {
  font-size: 12px;
  color: #909399;
}

/* 检测区域样式 */
.detection-section {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.detection-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.detection-button {
  min-width: 120px;
  height: 40px;
}

.progress-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.custom-progress {
  margin: 0;
}

.progress-text {
  font-size: 12px;
  color: #67c23a;
}

/* 图片处理区域样式 */
.image-processor {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.processor-header {
  margin-bottom: 20px;
}

.processor-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.processor-header p {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.controls {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap; /* 确保在小屏幕上能够换行 */
}

.image-container {
  display: flex;
  gap: 24px;
}

.original-image, .processed-image {
  flex: 1;
  position: relative;
}

.original-image h3, .processed-image h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.muted-text {
  font-weight: normal;
  font-size: 14px;
  color: #909399;
}

.canvas-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  background-color: #f5f7fa;
}

canvas {
  max-width: 100%;
  display: block;
  cursor: crosshair;
}

.result-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  background-color: #f5f7fa;
}

.result-container img {
  max-width: 100%;
  display: block;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  color: #909399;
}

.loading-icon {
  font-size: 24px;
  margin-bottom: 12px;
  animation: spin 1.5s linear infinite;
}

.no-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 30px;
  color: #909399;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.no-result .el-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 新增样式 */
.save-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .controls .el-button {
    margin-bottom: 8px;
  }
}
</style>