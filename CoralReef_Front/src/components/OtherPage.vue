<template>
    <div class="other-page">
        <!-- 上传区域 -->
        <div class="upload-section">
            <div class="section-header">
                <h2>批量上传</h2>
                <p>上传多张珊瑚照片，系统将进行批量识别处理</p>
            </div>

            <el-upload class="custom-upload" drag action="http://localhost:8080/upload" multiple
                @success="handleUploadSuccess">
                <div class="upload-content">
                    <el-icon class="upload-icon"><upload-filled /></el-icon>
                    <div class="upload-text">
                        <span class="upload-main-text">拖动文件至区域内或<em>点击上传</em></span>
                        <span class="upload-sub-text">支持jpg/png格式，文件大小不超过50MB</span>
                    </div>
                </div>
            </el-upload>
        </div>

        <!-- 检测控制区域 -->
        <div class="detection-section">
            <div class="detection-header">
                <div class="button-group">
                    <el-button type="primary" class="detection-button" @click="startDetection">
                        开始批量检测
                        <el-icon class="el-icon--right">
                            <Upload />
                        </el-icon>
                    </el-button>

                    <el-button type="success" @click="saveImages" :loading="saving" class="save-button">
                        保存图片
                    </el-button>
                </div>

                <div class="progress-container">
                    <el-progress :percentage="progressPercentage" :stroke-width="12" status="success"
                        class="custom-progress" />
                    <span class="progress-text" v-if="progressPercentage > 0">
                        处理中... {{ progressPercentage }}%
                    </span>
                </div>
            </div>
        </div>

        <!-- 在结果显示区域前添加图表区域，使用 showTable 控制显示 -->
        <div class="chart-section" v-if="showTable">
            <div class="section-header">
                <h2>检测统计</h2>
                <p>珊瑚白化识别结果统计分析</p>
            </div>

            <div class="stat-card">
                <h3>置信度分布</h3>
                <div class="chart-container" ref="barChartRef"></div>
            </div>
        </div>

        <!-- 结果显示区域 -->
        <div class="results-section" v-if="showTable">
            <div class="section-header">
                <h2>检测结果</h2>
                <p>珊瑚白化识别结果展示</p>
            </div>

            <el-table :data="tableData" :border="parentBorder" style="width: 100%" class="custom-table"
                row-key="uniqueId">
                <el-table-column type="expand">
                    <template #default="props">
                        <div class="expanded-content">
                            <div class="expanded-item">
                                <span class="label">珊瑚状态:</span>
                                <span class="value">
                                    <el-tag :type="props.row.status === 'bleached' ? 'danger' : 'success'">
                                        {{ props.row.status === 'bleached' ? '白化珊瑚' : '健康珊瑚' }}
                                    </el-tag>
                                </span>
                            </div>
                            <!-- <div class="expanded-item">
                                <span class="label">检测时间:</span>
                                <span class="value">{{ new Date().toLocaleString() }}</span>
                            </div> -->
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="图片名称" prop="image_name" min-width="150">
                    <template #default="scope">
                        <div class="image-name">
                            <el-icon>
                                <Document />
                            </el-icon>
                            <span>{{ scope.row.image_name }}</span>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="图片展示" min-width="400">
                    <template #default="scope">
                        <div class="image-preview">
                            <el-image style="width: 400px; height: 200px; cursor: pointer;" :src="scope.row.save_path"
                                :preview-src-list="[scope.row.save_path]" :initial-index="0" :preview-teleported="true"
                                fit="cover" />
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="150" fixed="right">
                    <template #default="scope">
                        <div class="table-actions">
                            <el-button type="primary" size="small" @click="viewDetails(scope.row)" plain circle>
                                <el-icon>
                                    <View />
                                </el-icon>
                            </el-button>
                            <el-button type="success" size="small" @click="downloadImage(scope.row)" plain circle>
                                <el-icon>
                                    <Download />
                                </el-icon>
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import {
    UploadFilled,
    Upload,
    Document,
    View,
    Download
} from "@element-plus/icons-vue";
import { ElMessage } from 'element-plus';
import api from '@/utils/api';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册 ECharts 组件
echarts.use([BarChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent, CanvasRenderer]);

const parentBorder = ref(true);
const tableData = ref([]);
const showTable = ref(false);  // 控制表格显示的状态
const progressPercentage = ref(0);
const saving = ref(false);
const barChartRef = ref(null);
let barChart = null;

const startDetection = async () => {
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

    try {
        const response = await api.post('/api/yolo/multiple');
        tableData.value = response.data.map((item, index) => ({
            ...item,
            uniqueId: item.id || `row-${index}-${Date.now()}`
        }));
        showTable.value = true;

        // 确保进度条完成
        progressPercentage.value = 100;

        // 初始化图表
        nextTick(() => {
            initBarChart();
        });
    } catch (error) {
        console.error('Error fetching tableData:', error);
        progressPercentage.value = 0; // 出错时重置进度条
    }
};

// 初始化柱状图
const initBarChart = () => {
    // 确保图表容器和数据存在
    if (!barChartRef.value || tableData.value.length === 0) return;

    console.log(tableData.value);

    // 处理图表实例
    if (barChart) {
        barChart.dispose();
    }

    barChart = echarts.init(barChartRef.value);

    // 将置信度分组
    const confidenceGroups = {
        '90-100%': 0,
        '80-90%': 0,
        '70-80%': 0,
        '60-70%': 0,
        '<60%': 0
    };

    // 遍历 tableData
    tableData.value.forEach(item => {
        if (Array.isArray(item.detections)) {
            item.detections.forEach(detection => {
                const confidence = parseFloat(detection.confidence || 0) * 100;

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
        }
    });

    // 设置图表选项
    const option = {
        title: {
            text: '识别置信度分布',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function (params) {
                // 计算当前置信度区间的数量占总数的百分比
                const total = tableData.value.length;
                const count = params[0].value;
                const percent = ((count / total) * 100).toFixed(1);
                return `${params[0].name}<br/>识别区块数量: ${count} (${percent}%)`;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%', // 增加底部空间以显示标签
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
                    margin: 15 // 增加与轴的距离
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: '图片数量',
                nameLocation: 'middle',
                nameGap: 35
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

    barChart.setOption(option);
};

// 处理窗口大小改变
const handleResize = () => {
    if (barChart) {
        barChart.resize();
    }
};

// 组件卸载时的清理工作
const onUnmounted = () => {
    if (barChart) {
        barChart.dispose();
        barChart = null;
    }
    window.removeEventListener('resize', handleResize);
};

const handleUploadSuccess = (response, file, fileList) => {
    console.log('文件上传成功:', response);
};

const viewDetails = (row) => {
    console.log('查看详情:', row);
    // 实现查看详情的逻辑
};

const downloadImage = (row) => {
    console.log('下载图片:', row);

    // 创建一个fetch请求获取图片blob数据
    fetch(row.save_path)
        .then(response => response.blob())
        .then(blob => {
            // 创建一个blob URL
            const blobUrl = window.URL.createObjectURL(blob);

            // 创建下载链接
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = row.image_name || 'downloaded-image.jpg'; // 设置下载文件名
            link.style.display = 'none';

            // 添加到DOM，触发点击，然后移除
            document.body.appendChild(link);
            link.click();

            // 清理
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl); // 释放blob URL
            }, 100);
        })
        .catch(error => {
            console.error('下载图片失败:', error);
            // 如果fetch失败，回退到原来的方法
            const link = document.createElement('a');
            link.href = row.save_path;
            link.download = row.image_name || 'downloaded-image.jpg';
            link.target = '_blank'; // 添加这行以防止在某些浏览器中改变当前页面
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
};

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

// 监听窗口大小变化
onMounted(() => {
    window.addEventListener('resize', handleResize);
});
</script>

<style scoped>
.other-page {
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

.button-group {
    display: flex;
    gap: 12px;
}

.detection-button {
    min-width: 140px;
    height: 40px;
}

.save-button {
    min-width: 120px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
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

/* 结果展示区域样式 */
.results-section {
    background-color: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.custom-table {
    margin-top: 20px;
    border-radius: 8px;
    overflow: hidden;
}

.custom-table :deep(.el-table__expanded-cell) {
    padding: 20px 50px;
    background-color: #f5f7fa;
}

.custom-table :deep(.el-table__row) {
    transition: all 0.3s;
}

.custom-table :deep(.el-table__row:hover) {
    background-color: #ecf5ff;
}

.custom-table :deep(.el-table__header-wrapper th) {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: 600;
    padding: 12px 0;
}

.expanded-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 10px 0;
}

.expanded-item {
    display: flex;
    align-items: center;
}

.expanded-item .label {
    width: 80px;
    color: #606266;
    font-weight: 500;
}

.expanded-item .value {
    color: #303133;
}

.image-name {
    display: flex;
    align-items: center;
    gap: 8px;
}

.image-name .el-icon {
    color: #909399;
}

.image-preview {
    padding: 10px 0;
}

.image-preview :deep(.el-image) {
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
}

.image-preview :deep(.el-image:hover) {
    transform: scale(1.02);
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.table-actions {
    display: flex;
    justify-content: center;
    gap: 8px;
}

.table-actions :deep(.el-button) {
    margin: 0;
}

/* 没有数据时的展示 */
.custom-table :deep(.el-table__empty-block) {
    min-height: 200px;
}

.custom-table :deep(.el-table__empty-text) {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #909399;
    line-height: 1.6;
}

.custom-table :deep(.el-table__empty-text::before) {
    content: "";
    display: block;
    width: 60px;
    height: 60px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23dcdfe6'%3E%3Cpath d='M20,6h-8l-2-2H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8C22,6.9,21.1,6,20,6z M20,18H4V6h5.2l2,2H20V18z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    margin-bottom: 12px;
}

/* 媒体查询，确保在小屏幕上的响应性 */
@media (max-width: 768px) {
    .detection-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .button-group {
        width: 100%;
        margin-bottom: 16px;
    }

    .detection-button,
    .save-button {
        flex: 1;
    }

    .custom-table :deep(.el-table__expanded-cell) {
        padding: 15px;
    }
}

/* 图表区域样式 */
.chart-section {
    background-color: white;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stat-card {
    border-radius: 8px;
    padding: 16px;
    margin-top: 16px;
    background-color: #f9f9f9;
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