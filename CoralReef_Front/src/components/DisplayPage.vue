<template>
    <div>
      <!-- 时间筛选 -->
      <el-form inline>
        <el-form-item label="选择日期:">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            @change="filterImages"
          />
        </el-form-item>
  
        <!-- 图片种类切换 -->
        <el-form-item label="选择图片种类:">
          <el-select v-model="selectedType" placeholder="选择种类" @change="filterImages">
            <el-option label="所有" value="all"></el-option>
            <el-option label="种类1" value="type1"></el-option>
            <el-option label="种类2" value="type2"></el-option>
            <!-- 添加更多种类 -->
          </el-select>
        </el-form-item>
      </el-form>
  
      <!-- 按月份分块展示图片 -->
      <div v-for="(images, month) in filteredGroupedImages" :key="month">
        <h3>{{ month }}</h3>
        <el-row :gutter="20">
          <el-col
            v-for="image in images"
            :key="image.id"
            :span="8"
          >
            <el-card :body-style="{ padding: '0px' }">
              <img
                :src="image.url"
                class="image"
                @click="showImageDetails(image)"
              />
              <div style="padding: 14px">
                <span>{{ image.description }}</span>
                <div class="bottom">
                  <time class="time">{{ image.date }}</time>
                  <el-tag
                    type="info"
                    @click="showImageDetails(image)"
                    style="cursor: pointer;"
                  >
                    详情
                  </el-tag>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
  
      <!-- 图片详情 -->
      <el-dialog :visible.sync="dialogVisible" title="图片详情">
        <p>描述: {{ selectedImage?.description }}</p>
        <p>日期: {{ selectedImage?.date }}</p>
        <p>种类: {{ selectedImage?.type }}</p>
      </el-dialog>
    </div>
  </template>
  
  <script>
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
        images: [
          // 示例图片数据
          { id: 1, url: 'http://localhost:8080/UploadPhoto/cc193fd1-6322-42d7-a823-f4063d82a808_1.jpg', description: '描述1', date: '2025-02-06', type: 'type1' },
          { id: 2, url: 'http://localhost:8080/UploadPhoto/cc193fd1-6322-42d7-a823-f4063d82a808_1.jpg', description: '描述2', date: '2025-02-07', type: 'type2' },
          { id: 3, url: 'http://localhost:8080/UploadPhoto/cc193fd1-6322-42d7-a823-f4063d82a808_1.jpg', description: '描述2', date: '2025-03-07', type: 'type1' },
          { id: 4, url: 'http://localhost:8080/UploadPhoto/cc193fd1-6322-42d7-a823-f4063d82a808_1.jpg', description: '描述2', date: '2025-04-07', type: 'type2' },
          // 更多图片数据...
        ],
        selectedDate: '',
        selectedType: 'all',
        groupedImages: {},
        filteredGroupedImages: {},
        selectedImage: null,
        dialogVisible: false,
      };
    },
    methods: {
      filterImages() {
        const filteredImages = this.images.filter(image => {
          const matchesDate = this.selectedDate ? image.date === this.selectedDate : true;
          const matchesType = this.selectedType === 'all' ? true : image.type === this.selectedType;
          return matchesDate && matchesType;
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
          const month = image.date.slice(0, 7); // 提取年月
          if (!groups[month]) {
            groups[month] = [];
          }
          groups[month].push(image);
          return groups;
        }, {});
        this.filteredGroupedImages = this.groupedImages; // 初始化时显示所有分组
      },
    },
    mounted() {
      this.groupImagesByMonth(); // 初始化时按月份分组图片
    },
  };
  </script>
  
  <style scoped>
  .time {
    font-size: 12px;
    color: #999;
  }
  
  .bottom {
    margin-top: 13px;
    line-height: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .image {
    width: 100%;
    display: block;
  }
  </style>