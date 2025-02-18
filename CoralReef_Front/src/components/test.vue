<template>
  <div>
    <!-- 筛选输入框 -->
    <input v-model="filterText" placeholder="输入关键词进行筛选" @input="filterImages" />

    <!-- 图片展示区域 -->
    <div class="image-grid">
      <div
        v-for="image in filteredImages"
        :key="image.id"
        class="image-item"
        @click="toggleSelectImage(image)"
      >
        <img :src="image.url" :alt="image.description" />
        <p>{{ image.description }}</p>
        <!-- 选中标记 -->
        <div v-if="selectedImages.includes(image)" class="checkmark">&#10003;</div>
      </div>
    </div>

    <!-- 下载按钮 -->
    <button @click="downloadSelectedImages" :disabled="selectedImages.length === 0">
      下载选中图片
    </button>

    <!-- 图片详情对话框 -->
    <el-dialog :visible.sync="dialogVisible" title="图片详情">
      <p>描述: {{ selectedImage?.description }}</p>
      <p>日期: {{ selectedImage?.date }}</p>
      <p>种类: {{ selectedImage?.type }}</p>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      images: [
        // 示例图片数据
        { id: 1, url: 'http://localhost:8080/UploadPhoto/cc193fd1-6322-42d7-a823-f4063d82a808_1.jpg', description: 'Image 1', date: '2023-01-01', type: 'Type A' },
        { id: 2, url: 'http://localhost:8080/UploadPhoto/cc193fd1-6322-42d7-a823-f4063d82a808_1.jpg', description: 'Image 2', date: '2023-01-02', type: 'Type B' },
        // 更多图片数据...
      ],
      filterText: '',
      filteredImages: [],
      selectedImages: [],
      selectedImage: null,
      dialogVisible: false,
    };
  },
  methods: {
    filterImages() {
      this.filteredImages = this.images.filter(image =>
        image.description.toLowerCase().includes(this.filterText.toLowerCase())
      );
    },
    toggleSelectImage(image) {
      const index = this.selectedImages.indexOf(image);
      if (index > -1) {
        this.selectedImages.splice(index, 1);
      } else {
        this.selectedImages.push(image);
      }
    },
    downloadSelectedImages() {
      this.selectedImages.forEach(image => {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = image.description;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    },
    showImageDetails(image) {
      this.selectedImage = image;
      this.dialogVisible = true;
    },
  },
  mounted() {
    this.filteredImages = this.images; // 初始化时显示所有图片
  },
};
</script>

<style>
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.image-item {
  position: relative;
  cursor: pointer;
  text-align: center;
}

.image-item img {
  width: 100%;
  height: auto;
}

.checkmark {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  padding: 5px;
  font-size: 16px;
  color: green;
}
</style>