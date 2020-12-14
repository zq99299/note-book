<template>
  <div class="book-list">
    <div class="single-member effect-2">
      <div class="member-image">
        <img src="./none.png" alt="Member">
      </div>
      <div class="member-info">
        <h3>缓存架构-亿级流量电商详情页系统实战</h3>
        <h5>学习笔记-完整 195 章</h5>
        <p>第二版：缓存架构+高可用服务架构+微服务架构</p>
        <div class="social-touch">
          <a href="cache-pdp/">
            阅读更多
          </a>
        </div>
      </div>
    </div>
    <div class="single-member effect-2">
      <div class="member-image">
        <img src="./elasticsearch.png" alt="Member">
      </div>
      <div class="member-info">
        <h3>elasticsearch 核心篇</h3>
        <h5>学习笔记-中华石杉讲解</h5>
        <p>核心知识篇；基于 V5.2+ 版本讲解</p>
        <div class="social-touch">
          <a href="elasticsearch-core/">
            阅读更多
          </a>
        </div>
      </div>
    </div>
    <div class="single-member effect-2">
      <div class="member-image">
        <img src="./elasticsearch.png" alt="Member">
      </div>
      <div class="member-info">
        <h3>elasticsearch 高级篇</h3>
        <h5>学习笔记-中华石杉讲解</h5>
        <p>高级知识篇；基于 V5.2+ 版本讲解</p>
        <div class="social-touch">
          <a href="elasticsearch-senior/">
            阅读更多
          </a>
        </div>
      </div>
    </div>
    <div class="single-member effect-2">
      <div class="member-image">
        <img src="./spring-cloud.png" alt="Member">
      </div>
      <div class="member-info">
        <h3>spring-cloud</h3>
        <h5>官网教程学习/实践笔记</h5>
        <p>官网教程翻译实践笔记，用到那一块感觉不太明白的就去官网阅读实践以便并记录</p>
        <div class="social-touch">
          <a href="spring-cloud-tutorial/">
            阅读更多
          </a>
        </div>
      </div>
    </div>
    <div class="single-member effect-2">
      <div class="member-image">
        <img src="./none.png" alt="Member">
      </div>
      <div class="member-info">
        <h3>设计模式</h3>
        <h5>学习笔记-慕课课程</h5>
        <p>JAVA设计模式精讲 Debug 方式+内存分析，
          从设计模式定义、应用到源码解析，带你系统学习设计模式。</p>
        <div class="social-touch">
          <a href="imocc/design_pattern/">
            阅读更多
          </a>
        </div>
      </div>
    </div>
    <div class="single-member effect-2">
      <div class="member-image">
        <img src="./none.png" alt="Member">
      </div>
      <div class="member-info">
        <h3>研磨设计模式</h3>
        <h5>学习笔记-李兴华讲解</h5>
        <p>gof 的 23个 设计模式进行讲解，定义、结构和说明、不用模式和用模式解决方案对比、
          优缺点、使用场景、本质是什么</p>
        <div class="social-touch">
          <a href="design_pattern/">
            阅读更多
          </a>
        </div>
      </div>
    </div>
    <div class="single-member effect-2">
      <div class="member-image">
        <img src="./none.png" alt="Member">
      </div>
      <div class="member-info">
        <h3>MyCat 1</h3>
        <h5>学习笔记</h5>
        <p>源码学习、mycat 与 mysql 与 前端 是怎么交互的？结果是怎么返回到前端应用的？
          mysql 客户端协议学习</p>
        <div class="social-touch">
          <a href="mycat/">
            阅读更多
          </a>
        </div>
      </div>
    </div>
    <div class="single-member effect-2">
      <div class="member-image">
        <img src="./none.png" alt="Member">
      </div>
      <div class="member-info">
        <h3>MyCat 2</h3>
        <h5>学习笔记</h5>
        <p>源码阅读、proxy reactor 模型、透传流程</p>
        <div class="social-touch">
          <a href="mycat2/">
            阅读更多
          </a>
        </div>
      </div>
    </div>
    <div class="single-member effect-2">
      <div class="member-image">
        <img src="./none.png" alt="Member">
      </div>
      <div class="member-info">
        <h3>CSS 深入理解</h3>
        <h5>学习笔记-张鑫旭讲解</h5>
        <p>9 个常用 CSS 元素的深入讲解，干货多多，通俗易懂，必备工具书</p>
        <div class="social-touch">
          <a href="css-zxx/">
            阅读更多
          </a>
        </div>
      </div>
    </div>
    <div class="single-member effect-2">
      <div class="member-image">
        <img src="./git.png" alt="Member">
      </div>
      <div class="member-info">
        <h3>Git</h3>
        <h5>学习笔记</h5>
        <p>GitHub 如何测试别人提交的 pr</p>
        <div class="social-touch">
          <a href="git/">
            阅读更多
          </a>
        </div>
      </div>
    </div>
<!--    <div class="single-member effect-2">-->
<!--      <div class="member-image">-->
<!--        <img src="./none.png" alt="Member">-->
<!--      </div>-->
<!--      <div class="member-info">-->
<!--        <h3>谢孟媛</h3>-->
<!--        <h5>学习笔记</h5>-->
<!--        <p>英语发音篇、kk音标</p>-->
<!--        <div class="social-touch">-->
<!--          <a href="xiemengyuan/">-->
<!--            阅读更多-->
<!--          </a>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
  </div>
</template>

<script>
  export default {
    data () {
      return {
        msg: 'Hello this is <demo-1>'
      }
    }
  }
</script>
<style scoped lang="stylus">
  .book-list {
    width: 99%;
    margin: 15px auto;
  }

  /*= common css to all effects =*/
  .single-member {
    width: 265px;
    margin: 30px 1.5%;
    background-color: #fff;
    text-align: center;
    position: relative;
    display inline-block
  }

  .member-image img {
    max-width: 100%;
    vertical-align: middle;
  }

  h3 {
    font-size: 24px;
    font-weight: normal;
    margin: 10px 0 0;
    text-transform: uppercase;
  }

  h5 {
    font-size: 16px;
    font-weight: 300;
    margin: 0 0 15px;
    line-height: 22px;
  }

  p {
    font-size: 14px;
    font-weight: 300;
    line-height: 22px;
    padding: 0 30px;
    margin-bottom: 10px;
  }

  .social-touch a {
    display: inline-block;
    width: 27px;
    height: 26px;
    vertical-align: middle;
    margin: 0 2px;
    /*background-image: url(../images/social-icons.png);*/
    background-repeat: no-repeat;
    opacity: 0.7;
    transition: 0.3s;
    color: white;
    width: 100%;
  }

  .social-touch a:hover {
    opacity: 1;
    transition: 0.3s;
  }

  .fb-touch {
    background-position: 0 0;
  }

  .tweet-touch {
    background-position: -35px 0;
  }

  .linkedin-touch {
    background-position: -71px 0;
  }

  .icon-colored .fb-touch {
    background-position: 0 -27px;
  }

  .icon-colored .tweet-touch {
    background-position: -35px -27px;
  }

  .icon-colored .linkedin-touch {
    background-position: -71px -27px;
  }

  /*= common css to all effects end =*/

  /*= effect-2 css =*/
  .effect-2 {
    max-height: 302px;
    min-height: 302px;
    overflow: hidden;
  }

  .effect-2 h3 {
    padding-top: 7px;
    line-height: 33px;
  }

  .effect-2 .member-image {
    border-bottom: 5px solid #1fb554;
    height: 212px;
    overflow: hidden;
    width: 100%;
    transition: 0.4s;
    display: inline-block;
    float: none;
    vertical-align: middle;
  }

  .effect-2 .member-info {
    transition: 0.4s;
  }

  .effect-2 .member-image img {
    width: 100%;
    vertical-align: bottom;
  }

  .effect-2 .social-touch {
    background-color: #1fb554;
    float: left;
    left: 0;
    bottom: 0;
    overflow: hidden;
    padding: 5px 0;
    width: 100%;
    transition: 0.4s;
  }

  .effect-2:hover .member-image {
    height: 81px;
    transition: 0.4s;
  }

  /*= effect-2 css end =*/
</style>
