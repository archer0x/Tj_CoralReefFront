<template>
  <div class="container">
    <div class="forms-container">
      <div class="signin-signup" id="app">
        <form action="" class="sign-in-form" @submit.prevent="handleSubmit">
          <b>同济大学白化珊瑚礁识别系统</b>
          <h2 class="title">Login</h2>
          <div class="input-field">
            <div class="el-icon-user-solid"></div>

            <input type="username" placeholder="Username" v-model="username">
          </div>
          <div class="input-field">
            <div class="el-icon-key"></div>
            <input type="password" placeholder="Password" v-model="password">
          </div>
          <div>
            <input type="submit" value="Login" class="btn">
          </div>

          <p class="social-text">或使用社交媒体登录</p>

          <br>
          <div class="social-media">
            <a href="https://im.qq.com/index/" class="social-icon">
              <img src="../assets/pictures/QQ.png" STYLE="height: 40px;width:40px">
            </a>
            <a href="https://wx.qq.com/" class="social-icon">
              <img src="../assets/pictures/weixin.png" STYLE="height: 40px;width:40px">
            </a>
            <a href="https://auth.alipay.com/login/index.htm" class="social-icon">
              <img src="../assets/pictures/zhifubao.png" STYLE="height: 40px;width:40px">
            </a>
            <a href="https://mail.tongji.edu.cn/" class="social-icon">
              <img src="../assets/pictures/tongji.png" STYLE="height: 40px;width:40px">
            </a>

          </div>
        </form>

        <form action="" class="sign-up-form" @submit.prevent="handleRegister">
          <b>同济大学白化珊瑚礁识别系统</b>
          <h2 class="title"> Sign up</h2>
          <div class="input-field">
            <i class="el-icon-user"></i>
            <input type="text" placeholder="Username" v-model="registerData.username">
          </div>
          <div class="input-field">
            <i class="el-icon-lock"></i>
            <input type="password" placeholder="Password" v-model="registerData.password">
          </div>
          <div class="input-field">
            <i class="el-icon-message"></i>
            <input type="email" placeholder="Email" v-model="registerData.email">
          </div>
          <div class="input-field">
            <i class="el-icon-phone"></i>
            <input type="tel" placeholder="Phone Number" v-model="registerData.phone">
          </div>
          <!-- 修改验证码部分 -->
          <div class="input-field" style="display: flex">
            <input 
              style="margin-left: 10px" 
              type="text" 
              placeholder="验证码" 
              v-model="registerData.code">
            <button 
              id="send-sms-code-btn" 
              style="padding: 0 0;
                    background-color: #247fe0;
                    color: #fff;
                    border: none;
                    border-radius: 40px;
                    cursor: pointer;
                    flex: 1;
                    justify-content: flex-end;"
              @click="sendVerificationCode">获取邮箱验证码
            </button>
            <div 
              id="countdown" 
              style="display: none;
                     padding: 0 0;
                     background-color: #f0f0f0;
                     color: #343232;
                     border: none;
                     border-radius: 40px;
                     cursor: pointer; flex: 1;
                     justify-content: flex-end;
                     margin-top: 15px;
                     margin-right: 5px;">
            </div>
          </div>
          <input type="submit" value="Sign up" class="btn" style="margin-bottom: 50px;">
          <p class="social-text">或使用社交媒体注册</p>
          <div class="social-media" style="margin-top: 50px;">
            <a href="https://im.qq.com/index/" class="social-icon">
              <img src="../assets/pictures/QQ.png" STYLE="height: 40px;width:40px">
            </a>
            <a href="https://wx.qq.com/" class="social-icon">
              <img src="../assets/pictures/weixin.png" STYLE="height: 40px;width:40px">
            </a>
            <a href="https://auth.alipay.com/login/index.htm" class="social-icon">
              <img src="../assets/pictures/zhifubao.png" STYLE="height: 40px;width:40px">
            </a>
            <a href="https://mail.tongji.edu.cn/" class="social-icon">
              <img src="../assets/pictures/tongji.png" STYLE="height: 40px;width:40px">
            </a>
          </div>
        </form>
      </div>
    </div>
    <div class="panels-container">
      <div class="panel left-panel">
        <div class="content">
          <h3>
            没有账户？
          </h3>
          <p>如果您没有账户
            <br>请通过您的邮箱进行注册，
            这样您可以获得一个账户。
          </p>
          <button class="btn transparent" id="sign-up-btn"> Sign up</button>
        </div>
        <img src="../assets/pictures/register.svg" class="image">

      </div>
      <div class="panel right-panel">
        <div class="content">
          <h3>
            已有账户？
          </h3>
          <p>如果您已经注册账户,
            <br>请使用您的用户名和密码登录。
          </p>
          <button class="btn transparent" id="sign-in-btn">Login</button>
        </div>
        <img src="../assets/pictures/login.svg" class="image">

      </div>
    </div>
  </div>
</template>

<style>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

body,
input {
  font-family: 'Poppins', sans-serif;
}

.container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: #fff;
  overflow: hidden;
}

.forms-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

}

form {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  grid-column: 1 /2;
  grid-row: 1 / 2;
  padding: 0 5rem;
  overflow: hidden;
  transition: 0.2s 0.7s ease-in-out;
}

form.sign-in-form {
  z-index: 2;
}

.container::before {
  content: ' ';
  position: absolute;
  width: 2000px;
  height: 2800px;
  border-radius: 50%;
  background: linear-gradient(145deg, #4481eb, #04befe);
  top: -10%;
  right: 48%;
  transform: translateY(-50%);
  z-index: 6;
  transition: 1.8s ease-in-out;
}

form.sign-up-form {
  z-index: 1;
  opacity: 0;
}

.title {
  font-size: 2.2rem;
  color: #444;
  margin-bottom: 10px;
}

.input-field {
  max-width: 380px;
  width: 100%;
  height: 55px;
  background-color: #f0f0f0;
  margin: 10px 0;
  border-radius: 55px;
  display: grid;
  grid-template-columns: 15% 85%;
  /*padding: 0 .4rem;*/

  margin-top: 20px;
}

.input-field phonenum {
  margin-left: 0px;
}

.input-field i {
  text-align: center;
  line-height: 55px;
  color: #acacac;
  font-size: 1.1rem;

}

.input-field input {
  background: none;
  outline: none;
  border: none;
  line-height: 1;
  font-weight: 400;
  font-size: 1.1rem;
  color: #333;
}

.input-field input::placeholder {
  color: #aaa;
  font-weight: 380;
}

.btn {
  width: 150px;
  height: 50px;
  border: none;
  outline: none;
  border-radius: 49px;
  cursor: pointer;
  background-color: #5995fd;
  color: #fff;
  text-transform: uppercase;
  font-weight: 600;
  margin: 10px 0;
  transition: .5s;
}

.btn:hover {
  background-color: #4d84e2;
}

.social-text {
  padding: .7m 0;
  font-size: 1rem;
}

.social-media {
  display: flex;
  justify-content: center;
}

.social-icon {
  height: 46px;
  width: 46px;
  border: 1px solid#333;
  margin: 0 0.45rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  color: #333;
  font-size: 1.1rem;
  border-radius: 1.1rem;
  transition: 0.3s;
}

.social-icon:hover {
  color: #4481eb;
  border-color: #4481eb;
}

.signin-signup {
  position: absolute;
  top: 45%;
  left: 75%;
  transform: translate(-50%, -50%);
  width: 70%;
  display: grid;
  grid-template-columns: 1fr;
  z-index: 5;
  transition: 1s 0.7s ease-in-out;
}

.panels-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  text-align: center;
  z-index: 7;
}

.left-panel {
  pointer-events: all;
  padding: 3rem 17% 2rem 12%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.panel .content {
  color: #fff;
  transition: .9s .6s ease-in-out;
  width: 80%;
  margin-top: 40px;
}

.panel h3 {
  font-weight: 600;
  line-height: 1;
  font-size: 1.5rem;
}

.panel p {
  font-size: 0.95rem;
  padding: 0.7rem 0;
}

.btn.transparent {
  margin: 0 0 30px 0;
  background: none;
  border: 2px solid#fff;
  width: 130px;
  height: 41px;
  font-weight: 600;
  font-size: 0.8rem;
}

.right-panel {
  padding: 3rem 12% 2rem 17%;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.image {
  width: 70%;
  transition: 1.1s .4s ease-in-out;
  margin-top: 20px;
  align-self: center;
}

.right-panel .content,
.right-panel .image {
  transform: translateX(1000px);
}

.container.sign-up-mode::before {
  transform: translate(100%, -50%);
  right: 52%;

}

.btn {
  margin-top: 30px;
  margin-bottom: 50px;
  width: 380px;
}

.container.sign-up-mode .left-panel .image,
.container.sign-up-mode .left-panel .content {
  transform: translateX(-1000px);
}

.container.sign-up-mode .right-panel .image,
.container.sign-up-mode .right-panel .content {
  transform: translateX(0px);
}

.container.sign-up-mode .left-panel {
  pointer-events: none;
}

.container.sign-up-mode .right-panel {
  pointer-events: all;
}

.container.sign-up-mode .signin-signup {
  left: 25%;
}

.container.sign-up-mode form.sign-in-form {
  z-index: 1;
  opacity: 0;
}

.container.sign-up-mode form.sign-up-form {
  z-index: 2;
  opacity: 1;
}

.input-field {
  margin: 15px 0;
}
</style>
<script>

import axios from "axios";
import api from '@/utils/api'
export default {
  name: "loginView",
  data() {
    return {
      // 登录数据
      username: '',
      password: '',

      // 注册数据
      registerData: {
        username: '',
        password: '',
        email: '',
        phone: '',
        code: '' // 添加验证码字段
      },

      errorMessage: '',
      countdown: null // 添加倒计时变量
    };
  },
  mounted() {

    const sign_in_btn = document.querySelector("#sign-in-btn");
    const sign_up_btn = document.querySelector("#sign-up-btn");
    const container = document.querySelector(".container");
    const phone_number = document.querySelector("#phone-number");
    sign_up_btn.addEventListener('click', () => {
      container.classList.add("sign-up-mode");
    });
    sign_in_btn.addEventListener('click', () => {
      clearInterval(countdown); // 清除计时器
      // phone_number.value = '123';
      document.getElementById('send-sms-code-btn').style.display = 'inline-block'; // 显示发送按钮
      document.getElementById('countdown').style.display = 'none'; // 隐藏计时器
      container.classList.remove("sign-up-mode");
    });

    var countdown; // 计时器变量
    const sendButton = document.querySelector("#send-sms-code-btn");

    // 添加点击事件监听器
    sendButton.addEventListener('click', () => {
      // 发送验证码的逻辑，这里使用 setTimeout 模拟异步操作
      event.preventDefault()
      setTimeout(function () {
        // 发送成功后

        sendButton.style.display = 'none'; // 隐藏发送按钮
        document.getElementById('countdown').style.display = 'inline-block'; // 显示计时器
        startCountdown(60); // 开始倒计时，时间为60秒
      }, 1000); // 假设发送验证码需要1秒钟
      console.log("test验证码")
    });


    function startCountdown(seconds) {
      document.getElementById('countdown').innerText = seconds + ' 秒后重新发送';
      countdown = setInterval(function () {
        seconds--;
        if (seconds > 0) {
          document.getElementById('countdown').innerText = seconds + ' 秒后重新发送';
        } else {
          clearInterval(countdown); // 清除计时器
          document.getElementById('send-sms-code-btn').style.display = 'inline-block'; // 显示发送按钮
          document.getElementById('countdown').style.display = 'none'; // 隐藏计时器
        }
      }, 1000);
    }
  },
  methods: {
    handleSubmit() {
      const formData = new FormData();
      formData.append('username', this.username);
      formData.append('password', this.password);

      api.post('/myLogin', formData, {})
        .then(response => {
          if (response.status === 200) {
            if (response.data && response.data.data && 'jwt' in response.data.data) {
              console.log('跳转');
              console.log(response.data);
              const token = response.data.data.jwt;
              this.setCookie('jwt', token, 1); // 设置过期时间为1天
              this.setCookie('username', this.username, 1);
              this.$router.push('/app/home');  // **登录后跳转主界面**
            } else {
              // 登录失败的情况，弹出错误提示
              this.$alert("登录失败,密码错误，请重新输入", {
                type: "error",
              });
            }
          } else {
            // 如果状态码不是200，表示登录失败，弹出错误提示
            this.$alert("登录失败，服务器故障中", {
              type: "error",
            });
          }
        })
        .catch(error => {
          // 处理请求错误
          console.error('Error fetching products:', error);
          this.$alert("登录失败,账号被弃用，请注册新账号", {
            type: "error",
          });
        });
    }
    ,
    handleRegister() {
      // 检查必填字段
      if (!this.registerData.username || !this.registerData.password || 
          !this.registerData.email || !this.registerData.phone || 
          !this.registerData.code) {
        this.$alert("请填写所有必填字段，包括验证码", {
          type: "warning",
        });
        return;
      }

      // 准备发送数据，按照 Email 类的结构
      const emailData = {
        username: this.registerData.username,
        password: this.registerData.password,
        email: this.registerData.email,
        phone: this.registerData.phone,
        code: this.registerData.code
      };

      // 发送注册请求
      api.post('http://localhost:8080/users/createOne', emailData)
        .then(response => {
          if (response.status === 200) {
            this.$alert('注册成功！', {
              type: 'success',
              callback: () => {
                // 自动切换到登录界面
                const container = document.querySelector(".container");
                container.classList.remove("sign-up-mode");
              }
            });
          }
        })
        .catch(error => {
          console.error('Registration failed:', error);
          this.$alert(error.response?.data?.message || '注册失败，请稍后再试', {
            type: "error",
          });
        });
    },
    sendVerificationCode(event) {
      event.preventDefault();
      
      // 检查邮箱是否已填写
      if (!this.registerData.email) {
        this.$alert("请先填写邮箱", {
          type: "warning",
        });
        return;
      }
      
      // 发送验证码请求
      api.post('http://localhost:8080/api/email/sendEmail', this.registerData.email, {
        headers: {
          'Content-Type': 'text/plain'  // 因为后端接收的是 String
        }
      })
      .then(response => {
        if (response.status === 200) {
          // 隐藏发送按钮，显示倒计时
          document.getElementById('send-sms-code-btn').style.display = 'none';
          document.getElementById('countdown').style.display = 'inline-block';
          this.startCountdown(60);
          
          this.$message({
            message: '验证码已发送至您的邮箱',
            type: 'success'
          });
        }
      })
      .catch(error => {
        console.error('发送验证码失败:', error);
        this.$alert(error.response?.data?.message || '发送验证码失败，请稍后再试', {
          type: "error",
        });
      });
    },
    startCountdown(seconds) {
      const countdownEl = document.getElementById('countdown');
      countdownEl.innerText = seconds + ' 秒后重新发送';
      
      if (this.countdown) {
        clearInterval(this.countdown);
      }
      
      this.countdown = setInterval(() => {
        seconds--;
        if (seconds > 0) {
          countdownEl.innerText = seconds + ' 秒后重新发送';
        } else {
          clearInterval(this.countdown);
          document.getElementById('send-sms-code-btn').style.display = 'inline-block';
          countdownEl.style.display = 'none';
        }
      }, 1000);
    },
    setCookie(name, value, days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = "expires=" + date.toUTCString();
      document.cookie = name + "=" + value + ";" + expires + ";path=http://localhost:8080/";
    },
  }
}

</script>