(window.webpackJsonp=window.webpackJsonp||[]).push([[599],{2119:function(t,a,n){"use strict";n.r(a);var s=n(13),e=Object(s.a)({},(function(){var t=this,a=t.$createElement,n=t._self._c||a;return n("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[n("h1",{attrs:{id:"reentrantreadwritelock"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#reentrantreadwritelock"}},[t._v("#")]),t._v(" ReentrantReadWriteLock")]),t._v(" "),n("h2",{attrs:{id:"场景"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#场景"}},[t._v("#")]),t._v(" 场景")]),t._v(" "),n("p",[n("img",{attrs:{src:"https://cdn.nlark.com/yuque/0/2023/png/651749/1678106282413-4d35819b-69db-4fd6-8fc8-ae1d517017e5.png#averageHue=%23fcfefb&clientId=u6ccd7242-e02d-4&from=paste&height=322&id=VxJ5u&name=image.png&originHeight=644&originWidth=754&originalType=binary&ratio=2&rotation=0&showTitle=false&size=84567&status=done&style=none&taskId=ubb6c2631-1cfa-45b9-b100-06b1b6f78da&title=&width=377",alt:"image.png"}}),t._v("\n有多个线程对一个数据进行读写，一般是读多写少，只有写的时候，才会让共享数据改变，才会导致出现问题。\n所以需要一种锁可以支持：写的时候都不能读，写完之后，都可以读。")]),t._v(" "),n("h2",{attrs:{id:"reentrantreadwritelock-介绍"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#reentrantreadwritelock-介绍"}},[t._v("#")]),t._v(" ReentrantReadWriteLock 介绍")]),t._v(" "),n("p",[t._v("ReentrantReadWriteLock 是 Java 中的一种锁，它提供了 "),n("strong",[t._v("读写分离的锁机制")]),t._v("。它允许多个线程同时读取共享资源，但只有一个线程可以写入共享资源。与普通的互斥锁相比，它可以提高并发性能。\nReentrantReadWriteLock 有两种锁：读锁和写锁。")]),t._v(" "),n("ul",[n("li",[t._v("读锁（ReadLock，也被称为 "),n("strong",[t._v("共享锁")]),t._v("）：可以被多个线程同时持有，只要没有线程持有写锁。")]),t._v(" "),n("li",[t._v("写锁（WriteLock也被称为 "),n("strong",[t._v("排他锁")]),t._v("）：必须独占整个锁，并且在写锁未被释放之前，所有的读锁和写锁都会被阻塞。")])]),t._v(" "),n("p",[t._v("此外，ReentrantReadWriteLock 还支持重入性，即同一个线程可以多次获取同一个锁，而不会被阻塞。\nReentrantReadWriteLock 适用于读多写少的场景，因为在读操作非常频繁的情况下，使用互斥锁会导致性能瓶颈。但是，在写操作非常频繁的情况下，使用 ReentrantReadWriteLock 会导致读锁等待时间过长，从而降低读操作的性能。")]),t._v(" "),n("p",[t._v("总结如下：")]),t._v(" "),n("ul",[n("li",[t._v("线程获取读锁的条件：\n"),n("ul",[n("li",[t._v("当前没有任何线程持有写锁时，可以直接获取读锁。")]),t._v(" "),n("li",[t._v("当前线程已经持有写锁，可以直接再次获取读锁。")]),t._v(" "),n("li",[t._v("如果有其他线程持有写锁，当前线程必须等待，直到所有的写锁都被释放，才能获取读锁。")])])]),t._v(" "),n("li",[t._v("线程获取写锁的条件：\n"),n("ul",[n("li",[t._v("当前没有任何线程持有写锁或读锁时，可以直接获取写锁。")]),t._v(" "),n("li",[t._v("当前线程已经持有写锁，可以直接再次获取写锁。")]),t._v(" "),n("li",[t._v("当前线程已经持有读锁，需要先释放读锁，然后再获取写锁。")]),t._v(" "),n("li",[t._v("如果有其他线程持有读锁或写锁，当前线程必须等待，直到所有的读锁和写锁都被释放，才能获取写锁。（独占锁的体现）")])])])]),t._v(" "),n("h2",{attrs:{id:"示例"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#示例"}},[t._v("#")]),t._v(" 示例")]),t._v(" "),n("p",[t._v("下面的例子可以体现出前面说的读写锁的获得条件的体现")]),t._v(" "),n("div",{staticClass:"language-java line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-java"}},[n("code",[n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("package")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("cn"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("mrcode"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("demo"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("boodadmin"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("lock")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("java"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("util"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("concurrent"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("locks"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")])]),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ReentrantReadWriteLock")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/**\n * @author mrcode\n * @date 2023/3/6 20:57\n */")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("class")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ReentrantReadWriteLockTest1")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 共享数据")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("private")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Object")]),t._v(" data"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 缓存是否有效")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("private")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("volatile")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("boolean")]),t._v(" cacheValid"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("private")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ReentrantReadWriteLock")]),t._v(" rwl "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ReentrantReadWriteLock")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("void")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("processCachedData")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 获得读锁 1")]),t._v("\n        rwl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("readLock")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("lock")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 如果缓存无效，更新 cache；否则执行使用缓存 data")]),t._v("\n        "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!")]),t._v("cacheValid"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 释放当前线程开始获取的读锁 1")]),t._v("\n            "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 获取写锁前需释放读锁: 独占锁的体现")]),t._v("\n            rwl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("readLock")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("unlock")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n            "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 或得写锁 2")]),t._v("\n            rwl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("writeLock")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("lock")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n            "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 双重判断")]),t._v("\n            "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!")]),t._v("cacheValid"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n                data "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Object")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n                cacheValid "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("true")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n            "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n            "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 锁降级，在释放写锁前获取读锁")]),t._v("\n            "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 获得写锁之后，还可以获得读锁 3")]),t._v("\n            rwl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("readLock")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("lock")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n            "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 释放写锁 2，依然持有读锁 3")]),t._v("\n            rwl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("writeLock")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("unlock")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n        "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 使用缓存")]),t._v("\n        "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// ...")]),t._v("\n        "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 释放读锁")]),t._v("\n        "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 这里有可能是释放的读锁 1，或则是释放的是读锁 3")]),t._v("\n        rwl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("readLock")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("unlock")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n")])]),t._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[t._v("1")]),n("br"),n("span",{staticClass:"line-number"},[t._v("2")]),n("br"),n("span",{staticClass:"line-number"},[t._v("3")]),n("br"),n("span",{staticClass:"line-number"},[t._v("4")]),n("br"),n("span",{staticClass:"line-number"},[t._v("5")]),n("br"),n("span",{staticClass:"line-number"},[t._v("6")]),n("br"),n("span",{staticClass:"line-number"},[t._v("7")]),n("br"),n("span",{staticClass:"line-number"},[t._v("8")]),n("br"),n("span",{staticClass:"line-number"},[t._v("9")]),n("br"),n("span",{staticClass:"line-number"},[t._v("10")]),n("br"),n("span",{staticClass:"line-number"},[t._v("11")]),n("br"),n("span",{staticClass:"line-number"},[t._v("12")]),n("br"),n("span",{staticClass:"line-number"},[t._v("13")]),n("br"),n("span",{staticClass:"line-number"},[t._v("14")]),n("br"),n("span",{staticClass:"line-number"},[t._v("15")]),n("br"),n("span",{staticClass:"line-number"},[t._v("16")]),n("br"),n("span",{staticClass:"line-number"},[t._v("17")]),n("br"),n("span",{staticClass:"line-number"},[t._v("18")]),n("br"),n("span",{staticClass:"line-number"},[t._v("19")]),n("br"),n("span",{staticClass:"line-number"},[t._v("20")]),n("br"),n("span",{staticClass:"line-number"},[t._v("21")]),n("br"),n("span",{staticClass:"line-number"},[t._v("22")]),n("br"),n("span",{staticClass:"line-number"},[t._v("23")]),n("br"),n("span",{staticClass:"line-number"},[t._v("24")]),n("br"),n("span",{staticClass:"line-number"},[t._v("25")]),n("br"),n("span",{staticClass:"line-number"},[t._v("26")]),n("br"),n("span",{staticClass:"line-number"},[t._v("27")]),n("br"),n("span",{staticClass:"line-number"},[t._v("28")]),n("br"),n("span",{staticClass:"line-number"},[t._v("29")]),n("br"),n("span",{staticClass:"line-number"},[t._v("30")]),n("br"),n("span",{staticClass:"line-number"},[t._v("31")]),n("br"),n("span",{staticClass:"line-number"},[t._v("32")]),n("br"),n("span",{staticClass:"line-number"},[t._v("33")]),n("br"),n("span",{staticClass:"line-number"},[t._v("34")]),n("br"),n("span",{staticClass:"line-number"},[t._v("35")]),n("br"),n("span",{staticClass:"line-number"},[t._v("36")]),n("br"),n("span",{staticClass:"line-number"},[t._v("37")]),n("br"),n("span",{staticClass:"line-number"},[t._v("38")]),n("br"),n("span",{staticClass:"line-number"},[t._v("39")]),n("br"),n("span",{staticClass:"line-number"},[t._v("40")]),n("br"),n("span",{staticClass:"line-number"},[t._v("41")]),n("br"),n("span",{staticClass:"line-number"},[t._v("42")]),n("br"),n("span",{staticClass:"line-number"},[t._v("43")]),n("br"),n("span",{staticClass:"line-number"},[t._v("44")]),n("br"),n("span",{staticClass:"line-number"},[t._v("45")]),n("br")])]),n("h2",{attrs:{id:"reentrantreadwritelock-的主要特点"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#reentrantreadwritelock-的主要特点"}},[t._v("#")]),t._v(" ReentrantReadWriteLock 的主要特点")]),t._v(" "),n("ol",[n("li",[t._v("读写分离：ReentrantReadWriteLock 提供了读锁和写锁，允许多个线程同时读取共享资源，但只允许一个线程写入共享资源。")]),t._v(" "),n("li",[t._v("重入性：ReentrantReadWriteLock 支持重入性，即同一个线程可以多次获取同一个锁，而不会被阻塞。")]),t._v(" "),n("li",[t._v("公平性：ReentrantReadWriteLock 支持公平和非公平两种模式。在公平模式下，锁的获取顺序与线程等待的时间有关，先等待的线程优先获取锁；在非公平模式下，锁的获取顺序与线程等待的时间无关，可能会导致某些线程一直无法获取锁。")]),t._v(" "),n("li",[t._v("性能：ReentrantReadWriteLock 在读操作非常频繁的情况下可以提高并发性能，但在写操作非常频繁的情况下，会导致读锁等待时间过长，从而降低读操作的性能。")]),t._v(" "),n("li",[t._v("可中断性：ReentrantReadWriteLock 提供了可中断的锁获取方法，即在等待锁的过程中，可以通过调用 "),n("code",[t._v("Thread.interrupt()")]),t._v("方法来中断线程的等待状态。")]),t._v(" "),n("li",[t._v("条件变量：ReentrantReadWriteLock 提供了 Condition 对象，可以用于线程之间的通信和同步。")])]),t._v(" "),n("p",[t._v("总之，ReentrantReadWriteLock 提供了一种灵活、高效、可重入的锁机制，适用于读多写少的场景。在实际使用中，需要根据具体的业务场景选择适当的锁策略。")]),t._v(" "),n("h2",{attrs:{id:"reentrantreadwritelock-vs-reentrantlock"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#reentrantreadwritelock-vs-reentrantlock"}},[t._v("#")]),t._v(" ReentrantReadWriteLock VS ReentrantLock")]),t._v(" "),n("p",[t._v("ReentrantReadWriteLock 和 ReentrantLock 都是 Java 中的锁机制，它们的主要区别如下：")]),t._v(" "),n("ol",[n("li",[t._v("锁的类型：\n"),n("ul",[n("li",[t._v("ReentrantReadWriteLock 提供了读锁和写锁两种类型的锁，支持多个线程同时读取共享资源，但只允许一个线程写入共享资源；")]),t._v(" "),n("li",[t._v("而 ReentrantLock 是一种互斥锁，同一时刻只允许一个线程获取锁。")])])]),t._v(" "),n("li",[t._v("锁的粒度：\n"),n("ul",[n("li",[t._v("ReentrantReadWriteLock 以更细的粒度来控制共享资源的访问，可以在读多写少的场景下提高并发性能；")]),t._v(" "),n("li",[t._v("而 ReentrantLock 是一种粗粒度的锁，适用于竞争激烈的场景。")])])]),t._v(" "),n("li",[t._v("锁的可重入性：ReentrantReadWriteLock 和 ReentrantLock 都支持锁的可重入性，即同一个线程可以多次获取同一个锁。")]),t._v(" "),n("li",[t._v("公平性：ReentrantReadWriteLock 和 ReentrantLock 都支持公平和非公平两种模式。在公平模式下，锁的获取顺序与线程等待的时间有关，先等待的线程优先获取锁；在非公平模式下，锁的获取顺序与线程等待的时间无关，可能会导致某些线程一直无法获取锁。")]),t._v(" "),n("li",[t._v("性能：\n"),n("ul",[n("li",[t._v("在读操作非常频繁的情况下，使用 ReentrantReadWriteLock 可以提高并发性能，但在写操作非常频繁的情况下，会导致读锁等待时间过长，从而降低读操作的性能。")]),t._v(" "),n("li",[t._v("而在竞争激烈的场景下，ReentrantLock 的性能更好。")])])])]),t._v(" "),n("p",[t._v("综上所述，ReentrantReadWriteLock 和 ReentrantLock 都是 Java 中常用的锁机制，适用于不同的业务场景。在实际使用中，需要根据具体的业务需求选择适当的锁机制。")]),t._v(" "),n("ul",[n("li",[t._v("如果是读多写少的场景，可以使用 ReentrantReadWriteLock 提高并发性能；")]),t._v(" "),n("li",[t._v("如果是竞争激烈的场景，可以使用 ReentrantLock 来提高并发性能。")])]),t._v(" "),n("p",[t._v("简单版区别：")]),t._v(" "),n("ul",[n("li",[t._v("ReentrantLock：完全互斥")]),t._v(" "),n("li",[t._v("ReentrantReadWriteLock：读锁共享，写锁互斥")])])])}),[],!1,null,null,null);a.default=e.exports}}]);