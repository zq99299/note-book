<template>
    <div class="book-list">
        <div class="book-item">
            <a href="mycat2/">
                <img class="book-img" src="hero.png">
                <p>《Mycat2 学习笔记》</p>
            </a>
        </div>
        <div class="book-item">
            <a href="imocc/design_pattern/">
                <img class="book-img" src="hero.png">
                <p>《设计模式（慕课）》</p>
            </a>
        </div>
        <div class="book-item">
            <a href="design_pattern/">
                <img class="book-img" src="hero.png">
                <p>《研磨设计模式（李兴华）》</p>
            </a>
        </div>
        <div class="book-item">
            <a href="mycat/">
                <img class="book-img" src="hero.png">
                <p>《mycat1 学习笔记》</p>
            </a>
        </div>
        <div class="book-item">
            <a href="vue/">
                <img class="book-img" src="hero.png">
                <p>《vue 学习笔记》</p>
            </a>
        </div>
        <div class="book-item">
            <a href="gradle/">
                <img class="book-img" src="hero.png">
                <p>《Gradle 笔记》</p>
            </a>
        </div>
        <div class="book-item">
            <a href="git/">
                <img class="book-img" src="hero.png">
                <p>《Git 笔记》</p>
            </a>
        </div>
        <div class="book-item">
            <a href="java/">
                <img class="book-img" src="hero.png">
                <p>《JAVA 笔记》</p>
            </a>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                msg: 'Hello this is <demo-1>'
            }
        }
    }
</script>
<style scoped>
    .book-list {
        width: 99%;
        margin: 15px auto;
    }

    .book-list .book-item {
        width: 290px;
        text-align: center;
        display: inline-block;
        margin: 10px;
        /*background: #2c3e50;*/
    }

    .book-list .book-img {
        width: 100%;
    }

    .book-item p {
        margin: 0 16px 10px;
        height: 40px;
        line-height: 20px;
        overflow: hidden;
        color: #333;
    }
</style>
