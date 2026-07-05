const modules = [
  {
    id: "day1-types",
    kicker: "第 01 节 · 基本类型",
    title: "基本类型、宽度和嵌入式里的类型选择",
    summary: "char/int/float、stdint、sizeof、有符号和无符号",
    body: `
      <h3>为什么第 01 节要先学类型</h3>
      <p>在普通应用开发里，很多人写 <code>int</code> 就够了；但在 AUTOSAR 和嵌入式里，类型不是小事。类型会影响 RAM 占用、寄存器访问、通信报文解析、溢出行为、接口兼容性和 MISRA 检查结果。</p>
      <p>C 标准只保证 <code>char</code>、<code>short</code>、<code>int</code>、<code>long</code> 之间有相对大小关系，并不保证 <code>int</code> 一定是 32 位。不同编译器、不同芯片、不同 ABI 下，类型宽度可能不同。嵌入式项目通常用 <code>stdint.h</code> 或 AUTOSAR 的 <code>Std_Types.h</code> 来固定宽度。</p>

      <h3>你必须熟悉的类型</h3>
      <ul>
        <li><code>uint8_t</code>：无符号 8 位，常用于字节、报文、寄存器字段。</li>
        <li><code>sint8</code> / <code>int8_t</code>：有符号 8 位，范围是 -128 到 127。</li>
        <li><code>uint16_t</code>：无符号 16 位，常用于 DID、长度、计数值。</li>
        <li><code>uint32_t</code>：无符号 32 位，常用于寄存器、状态字、时间计数。</li>
        <li><code>float</code> / <code>double</code>：嵌入式里要谨慎使用，尤其是无 FPU 的 MCU。</li>
      </ul>

      <div class="note">
        <strong>工程直觉：</strong>
        如果一个变量要表示“原始字节”，优先想到 <code>uint8_t</code>；如果要表示“长度”，优先想到无符号整数，但要小心减法和比较；如果要表示“状态”，优先考虑枚举或明确的宏定义。
      </div>

      <h3><code>sizeof</code> 不是函数</h3>
      <p><code>sizeof</code> 是编译期运算符。它返回对象或类型占用的字节数。学习这一节时，你要养成一个习惯：看到变量就问自己，它占几个字节？它的范围是多少？它在表达式里会不会被提升？</p>
      <pre><code>#include &lt;stdio.h&gt;
#include &lt;stdint.h&gt;

int main(void)
{
    printf("sizeof(uint8_t)  = %zu\\n", sizeof(uint8_t));
    printf("sizeof(uint16_t) = %zu\\n", sizeof(uint16_t));
    printf("sizeof(uint32_t) = %zu\\n", sizeof(uint32_t));
    printf("sizeof(int)      = %zu\\n", sizeof(int));
    return 0;
}</code></pre>

      <h3>有符号和无符号</h3>
      <p><code>uint8_t</code> 的范围是 0 到 255。<code>int8_t</code> 的范围是 -128 到 127。二者底层都是 8 个 bit，但解释方式不同。嵌入式通信里，报文通常是无符号字节；物理量经过缩放后，可能需要有符号类型。</p>
      <div class="warning">
        <strong>常见坑：</strong>
        不要随手把有符号和无符号混在一起比较。比如 <code>int len = -1;</code> 和 <code>uint16_t max = 10;</code> 比较时，可能发生你不期待的转换。
      </div>

      <h3>本节练习</h3>
      <div class="practice">
        <ol>
          <li>写一个程序，打印 <code>char</code>、<code>short</code>、<code>int</code>、<code>long</code>、<code>uint8_t</code>、<code>uint16_t</code>、<code>uint32_t</code> 的 <code>sizeof</code>。</li>
          <li>定义一个 CAN 报文结构体，包含 <code>id</code>、<code>dlc</code>、<code>data[8]</code>，然后打印它的大小。</li>
          <li>写出 <code>uint8_t</code>、<code>uint16_t</code>、<code>uint32_t</code> 的最大值，并用代码验证。</li>
        </ol>
      </div>
    `,
    quiz: [
      {
        q: "在 AUTOSAR 嵌入式代码中，为什么常用 uint8_t 而不是 unsigned char？",
        options: ["因为 uint8_t 明确表达 8 位无符号宽度", "因为 unsigned char 不能存储字节", "因为 uint8_t 一定比 unsigned char 快", "因为 MISRA 禁止 unsigned char"],
        answer: 0
      },
      {
        q: "sizeof(uint32_t) 在常见平台上通常是多少？",
        options: ["1 字节", "2 字节", "4 字节", "8 字节"],
        answer: 2
      },
      {
        q: "uint8_t 能表示的数值范围是？",
        options: ["-128 到 127", "0 到 127", "0 到 255", "-255 到 255"],
        answer: 2
      },
      {
        q: "下列哪种说法最符合嵌入式工程习惯？",
        options: ["报文字节优先用明确宽度的无符号类型", "所有整数都用 int", "所有状态都用 float", "类型只影响可读性，不影响内存"],
        answer: 0
      }
    ]
  },
  {
    id: "day2-storage",
    kicker: "第 02 节 · 变量与存储期",
    title: "作用域、生命周期和变量到底放在哪里",
    summary: "局部变量、全局变量、static、extern、RAM/Flash 直觉",
    body: `
      <h3>三个问题：看见变量就问</h3>
      <p>读 C 代码时，不要只看变量名。你要问三个问题：这个名字在哪里可见？这个对象活多久？它大概放在内存的哪个区域？这三个问题分别对应作用域、生命周期和存储期。</p>

      <h3>局部变量</h3>
      <p>函数内部定义的普通变量通常在栈上。函数进入时创建，函数返回时失效。你不能返回局部变量的地址，因为函数返回后那块栈空间会被后续调用复用。</p>
      <pre><code>int *bad_func(void)
{
    int value = 10;
    return &value; /* 错误：返回了局部变量地址 */
}</code></pre>

      <h3>全局变量</h3>
      <p>全局变量的生命周期贯穿整个程序运行期。已初始化的全局变量通常在 <code>.data</code>，未初始化或初始化为 0 的全局变量通常在 <code>.bss</code>。</p>
      <pre><code>uint8_t g_rxBuffer[8];       /* 通常在 .bss */
uint32_t g_counter = 100U;   /* 通常在 .data */</code></pre>

      <h3><code>static</code> 的两种常见用法</h3>
      <p><code>static</code> 用在局部变量上，表示变量的生命周期变长：它不会随着函数返回而销毁，但名字仍然只在函数内部可见。</p>
      <pre><code>void Counter_MainFunction(void)
{
    static uint32_t counter = 0U;
    counter++;
}</code></pre>
      <p><code>static</code> 用在全局函数或全局变量上，表示这个符号只在当前 <code>.c</code> 文件内部可见。AUTOSAR 模块里，内部辅助函数经常写成 <code>static</code>，避免污染外部接口。</p>
      <pre><code>static void Dcm_UpdateSessionTimer(void)
{
    /* 只给本文件使用 */
}</code></pre>

      <h3><code>extern</code> 的意义</h3>
      <p><code>extern</code> 是声明，不是定义。它告诉编译器：这个变量或函数在别的地方定义，链接时会找到。</p>
      <pre><code>/* Dcm.c */
uint8_t Dcm_RxBuffer[8];

/* Dcm_Internal.h */
extern uint8_t Dcm_RxBuffer[8];</code></pre>

      <div class="warning">
        <strong>常见坑：</strong>
        不要在头文件里直接定义全局变量，比如 <code>uint8_t buffer[8];</code>。多个 <code>.c</code> 包含这个头文件时，可能造成重复定义。头文件里通常放 <code>extern</code> 声明，真正定义放在一个 <code>.c</code> 文件里。
      </div>

      <h3>本节练习</h3>
      <div class="practice">
        <ol>
          <li>写一个 <code>Counter.c</code>，内部有一个 <code>static uint32_t counter</code>，提供 <code>Counter_Inc</code> 和 <code>Counter_Get</code> 两个函数。</li>
          <li>故意在头文件里定义一个全局变量，然后让两个 <code>.c</code> 包含它，观察链接错误。</li>
          <li>把上面的错误改成 <code>extern</code> 声明 + 单个 <code>.c</code> 定义。</li>
        </ol>
      </div>
    `,
    quiz: [
      {
        q: "函数内部普通局部变量通常位于哪里？",
        options: ["Flash", "栈", ".rodata", "链接脚本文件本身"],
        answer: 1
      },
      {
        q: "static 修饰文件作用域函数时，主要效果是什么？",
        options: ["让函数运行更快", "让函数只能在当前源文件内被引用", "让函数返回值变成静态变量", "让函数进入 Flash"],
        answer: 1
      },
      {
        q: "extern uint8_t buf[8]; 最准确的含义是？",
        options: ["定义一个新数组", "声明这个数组在其他地方定义", "把数组清零", "把数组放入栈"],
        answer: 1
      },
      {
        q: "为什么不建议在头文件里直接定义全局变量？",
        options: ["会导致变量无法初始化", "多个源文件包含后可能重复定义", "头文件不能写变量名", "C 语言不支持全局变量"],
        answer: 1
      }
    ]
  },
  {
    id: "day3-qualifiers",
    kicker: "第 03 节 · 关键修饰符",
    title: "const、volatile 和嵌入式代码的真实意图",
    summary: "只读、寄存器、中断共享变量、优化器",
    body: `
      <h3><code>const</code>：表达“不应该被改”</h3>
      <p><code>const</code> 的核心作用是限制写入，并表达接口意图。配置表、只读参数、查表数据、固定 DID 表等，都很适合用 <code>const</code>。在嵌入式里，<code>const</code> 对象常常可以放到 Flash，节省 RAM。</p>
      <pre><code>static const uint16_t Dcm_SupportedDids[] = {
    0xF190U,
    0xF187U,
    0xF18CU
};</code></pre>

      <h3>读懂指针里的 <code>const</code></h3>
      <p>这个地方很多人会混。一个简单读法是：从变量名开始，向右看，再向左看。</p>
      <pre><code>const int *p1;       /* p1 指向的 int 不能通过 p1 修改 */
int const *p2;       /* 与 p1 等价 */
int * const p3 = &x; /* p3 这个指针本身不能再指向别处 */
const int * const p4 = &x; /* 指针本身和指向的值都受限制 */</code></pre>

      <h3><code>volatile</code>：告诉编译器“这个值可能被外部改变”</h3>
      <p><code>volatile</code> 不保证线程安全，也不保证原子性。它只告诉编译器：每次读写都要真的访问内存，不要自作聪明地缓存或优化掉。典型场景包括硬件寄存器、中断服务程序修改的变量、DMA 更新的内存。</p>
      <pre><code>static volatile uint8_t g_rxDone = 0U;

void Can_Isr(void)
{
    g_rxDone = 1U;
}

void MainLoop(void)
{
    while (g_rxDone == 0U) {
        /* 等待中断设置标志 */
    }
}</code></pre>

      <div class="warning">
        <strong>重点：</strong>
        <code>volatile</code> 不是锁。比如 32 位 MCU 上读写 8 位变量通常是原子的，但复杂表达式、读改写操作、多个变量一致性，都不能只靠 <code>volatile</code> 解决。
      </div>

      <h3>寄存器映射里的 <code>volatile</code></h3>
      <p>硬件寄存器必须用 <code>volatile</code>，因为寄存器值可能由硬件改变，读寄存器也可能有副作用。</p>
      <pre><code>typedef struct {
    volatile uint32_t CTRL;
    volatile uint32_t STATUS;
    volatile uint32_t DATA;
} Can_RegType;

#define CAN0 ((Can_RegType *)0x40000000UL)

void Can_Enable(void)
{
    CAN0-&gt;CTRL = 1U;
}</code></pre>

      <h3>本节练习</h3>
      <div class="practice">
        <ol>
          <li>写出四种 <code>const</code> 指针声明，并用注释解释。</li>
          <li>写一个 <code>volatile</code> flag，让一个函数设置它，另一个函数轮询它。</li>
          <li>定义一个模拟外设寄存器结构体，字段全部用 <code>volatile uint32_t</code>。</li>
        </ol>
      </div>
    `,
    quiz: [
      {
        q: "const uint16_t table[] 最主要表达什么？",
        options: ["table 是运行时必须改变的数据", "table 不应该被代码修改", "table 一定在栈上", "table 不能被读取"],
        answer: 1
      },
      {
        q: "int * const p 表示什么？",
        options: ["p 指向的 int 不能改", "p 本身不能改指向", "p 是 volatile 指针", "p 是空指针"],
        answer: 1
      },
      {
        q: "volatile 的主要作用是？",
        options: ["保证多任务互斥", "保证读写一定原子", "防止编译器优化掉必要的内存访问", "让变量进入 Flash"],
        answer: 2
      },
      {
        q: "下列哪种最适合使用 volatile？",
        options: ["普通局部临时变量", "硬件状态寄存器", "只读配置表", "函数参数名"],
        answer: 1
      }
    ]
  },
  {
    id: "day4-conversion",
    kicker: "第 04 节 · 表达式与转换",
    title: "整型提升、溢出和比较里的隐藏风险",
    summary: "integer promotion、隐式转换、溢出、MISRA 风格",
    body: `
      <h3>为什么 <code>uint8_t + uint8_t</code> 不一定还是 <code>uint8_t</code></h3>
      <p>C 语言在计算表达式时，会做整型提升。很多小于 <code>int</code> 的整数类型，比如 <code>uint8_t</code>、<code>int8_t</code>、<code>uint16_t</code>，参与运算时可能先被提升为 <code>int</code> 或 <code>unsigned int</code>。这就是很多“看起来是 8 位运算，实际不是”的来源。</p>
      <pre><code>uint8_t a = 200U;
uint8_t b = 100U;
uint8_t c = a + b; /* a + b 先提升后计算，再截断给 c */</code></pre>

      <h3>无符号溢出和有符号溢出</h3>
      <p>无符号整数溢出是按模回绕，比如 <code>uint8_t</code> 的 255 再加 1 变成 0。有符号整数溢出在 C 语言里是未定义行为，不能依赖它。</p>
      <pre><code>uint8_t x = 255U;
x = (uint8_t)(x + 1U); /* x 变成 0 */</code></pre>

      <h3>比较里的陷阱</h3>
      <p>有符号和无符号混合比较时，负数可能会被转换成很大的无符号数。嵌入式里这类 bug 很难发现，因为代码看起来很自然。</p>
      <pre><code>int len = -1;
uint16_t maxLen = 8U;

if (len &lt; maxLen) {
    /* 这里的结果可能不是初学者以为的那样 */
}</code></pre>

      <div class="note">
        <strong>MISRA 风格建议：</strong>
        不要让复杂表达式同时包含不同宽度、不同符号的整数。先拆开，显式检查范围，再做转换。代码稍微长一点，但工程上更稳。
      </div>

      <h3>更稳的写法</h3>
      <pre><code>Std_ReturnType CopyData(uint8_t *dst, uint16_t dstSize, const uint8_t *src, uint16_t len)
{
    Std_ReturnType ret = E_NOT_OK;

    if ((dst != NULL_PTR) && (src != NULL_PTR) && (len &lt;= dstSize)) {
        for (uint16_t i = 0U; i &lt; len; i++) {
            dst[i] = src[i];
        }
        ret = E_OK;
    }

    return ret;
}</code></pre>

      <h3>本节练习</h3>
      <div class="practice">
        <ol>
          <li>写 <code>uint8_t a = 250U; uint8_t b = 10U;</code>，观察相加后赋给 <code>uint8_t</code> 的结果。</li>
          <li>写一个有符号和无符号比较的例子，解释实际结果。</li>
          <li>写一个安全的 buffer copy 函数，要求检查空指针和长度。</li>
        </ol>
      </div>
    `,
    quiz: [
      {
        q: "uint8_t a, b; 表达式 a + b 通常会先发生什么？",
        options: ["数组退化", "整型提升", "自动进入 Flash", "变成指针"],
        answer: 1
      },
      {
        q: "uint8_t x = 255; x = x + 1; 最终 x 通常是多少？",
        options: ["0", "1", "255", "-1"],
        answer: 0
      },
      {
        q: "有符号整数溢出在 C 标准里属于什么？",
        options: ["完全可靠行为", "未定义行为", "一定回绕", "编译错误"],
        answer: 1
      },
      {
        q: "更符合安全嵌入式风格的做法是？",
        options: ["把所有类型都强转成 int", "复杂表达式里随便混用 signed 和 unsigned", "先检查范围，再做必要的显式转换", "忽略编译器警告"],
        answer: 2
      }
    ]
  },
  {
    id: "day5-review",
    kicker: "第 05 节 · 阶段复盘",
    title: "把第 01-05 节知识串起来：一个小型 Std_Types 练习",
    summary: "复盘、代码练习、阶段考核",
    body: `
      <h3>这一阶段你真正要带走的东西</h3>
      <p>第 01-05 节不要求你写出多复杂的程序，但要求你开始形成嵌入式 C 的底层直觉。以后看到任何一段代码，都先问：类型是什么？范围是什么？这个变量活多久？谁能访问它？它会不会被中断或硬件改掉？表达式里有没有隐藏转换？</p>

      <h3>阶段综合练习：简化版 Std_Types + Buffer 模块</h3>
      <p>建立一个小工程，先不用复杂构建系统，几个文件就够。</p>
      <pre><code>section01_05_project/
  Std_Types.h
  Buffer.h
  Buffer.c
  main.c</code></pre>

      <p><code>Std_Types.h</code> 里定义：</p>
      <pre><code>#ifndef STD_TYPES_H
#define STD_TYPES_H

#include &lt;stdint.h&gt;

typedef uint8_t Std_ReturnType;

#define E_OK      0U
#define E_NOT_OK 1U
#define NULL_PTR  ((void *)0)

#endif</code></pre>

      <p><code>Buffer.c</code> 实现这些函数：</p>
      <pre><code>Std_ReturnType Buffer_Copy(uint8_t *dst, uint16_t dstSize, const uint8_t *src, uint16_t len);
Std_ReturnType Buffer_Fill(uint8_t *dst, uint16_t dstSize, uint8_t value);
uint16_t Buffer_CountValue(const uint8_t *buf, uint16_t len, uint8_t value);</code></pre>

      <h3>验收标准</h3>
      <ul>
        <li>所有公开函数参数类型明确，不随手用 <code>int</code>。</li>
        <li>所有指针参数使用前检查空指针。</li>
        <li>所有长度相关操作检查边界。</li>
        <li>内部辅助函数如果只给本文件用，就加 <code>static</code>。</li>
        <li>只读输入 buffer 使用 <code>const uint8_t *</code>。</li>
        <li>不要在头文件里定义普通全局变量。</li>
      </ul>

      <div class="practice">
        <strong>建议复盘方法：</strong>
        写完以后逐行给自己讲解：这个变量是什么类型？它有没有可能溢出？这个指针能不能改数据？这个函数为什么返回 <code>Std_ReturnType</code>？如果别人传入 <code>NULL_PTR</code> 会怎样？
      </div>
    `,
    quiz: [
      {
        q: "只读输入 buffer 的参数更推荐写成？",
        options: ["uint8_t *src", "const uint8_t *src", "uint8_t const src", "volatile uint8_t src"],
        answer: 1
      },
      {
        q: "只在 Buffer.c 内部使用的辅助函数，推荐加什么修饰？",
        options: ["extern", "static", "volatile", "register"],
        answer: 1
      },
      {
        q: "长度参数 len 如果表示字节个数，通常不建议用？",
        options: ["uint16_t", "uint32_t", "int 且允许负数", "size_t"],
        answer: 2
      },
      {
        q: "Buffer_Copy 最先应该检查什么？",
        options: ["函数名是否够短", "指针是否为空、长度是否越界", "是否使用了浮点数", "是否有递归"],
        answer: 1
      },
      {
        q: "第 01-05 节的核心不是背语法，而是建立什么？",
        options: ["UI 设计能力", "内存、类型、链接可见性的工程直觉", "数据库能力", "脚本语言能力"],
        answer: 1
      }
    ]
  },
  {
    id: "week2-address",
    kicker: "第 06 节 · 指针地址",
    title: "指针第一课：地址、取地址和指针变量",
    summary: "地址、&、指针变量、指针自己的内存",
    body: `
      <h3>先别急着背语法：指针到底是什么</h3>
      <p>指针最朴素的定义是：<strong>保存地址的变量</strong>。普通变量保存一个值，比如 <code>int a = 10;</code>，变量 <code>a</code> 这块内存里放的是数字 10。指针变量也有自己的内存，只是它里面放的不是普通数字含义的业务值，而是另一个对象的地址。</p>
      <div class="pointer-diagram">
        <div class="cell"><span>变量 a</span><strong>10</strong><em>地址：0x1000</em></div>
        <div class="arrow">← p 保存这个地址</div>
        <div class="cell"><span>指针 p</span><strong>0x1000</strong><em>p 自己也有地址</em></div>
      </div>

      <h3><code>&</code>：取地址</h3>
      <p><code>&a</code> 的意思是“变量 <code>a</code> 的地址”。很多初学者会把 <code>a</code> 和 <code>&a</code> 混在一起，这是第一个要纠正的点。</p>
      <pre><code>#include &lt;stdio.h&gt;

int main(void)
{
    int a = 10;
    int *p = &a;

    printf("a 的值      = %d\\n", a);
    printf("a 的地址    = %p\\n", (void *)&a);
    printf("p 保存的地址 = %p\\n", (void *)p);
    printf("p 自己的地址 = %p\\n", (void *)&p);

    return 0;
}</code></pre>

      <p>这里要慢慢看：</p>
      <ul>
        <li><code>a</code>：表示变量 <code>a</code> 里存的值，也就是 10。</li>
        <li><code>&a</code>：表示变量 <code>a</code> 的地址。</li>
        <li><code>p</code>：表示指针变量 <code>p</code> 里存的内容，也就是 <code>a</code> 的地址。</li>
        <li><code>&p</code>：表示指针变量 <code>p</code> 自己的地址。</li>
      </ul>

      <h3><code>int *p</code> 里的 <code>*</code> 怎么理解</h3>
      <p><code>int *p</code> 的意思是：<code>p</code> 是一个指针，它指向的对象按 <code>int</code> 来解释。这里的 <code>int</code> 很重要，因为 CPU 只知道地址，C 编译器需要知道从这个地址开始应该取几个字节、按什么类型解释。</p>
      <pre><code>uint8_t  *p8;   /* 指向 1 字节对象 */
uint16_t *p16;  /* 指向 2 字节对象 */
uint32_t *p32;  /* 指向 4 字节对象 */</code></pre>

      <div class="note">
        <strong>关键直觉：</strong>
        指针的值是地址；指针的类型决定“从这个地址开始怎么读、怎么写、指针 + 1 跳多远”。
      </div>

      <h3>为什么嵌入式特别重视指针</h3>
      <p>因为嵌入式软件经常直接处理内存、报文 buffer、寄存器地址和配置表。比如 AUTOSAR 里常见的 <code>uint8 *SduDataPtr</code>，本质就是指向一段报文数据的地址。你看懂指针，就能看懂“数据在哪里”，也能看懂“函数有没有可能改这段数据”。</p>
      <pre><code>typedef struct {
    uint8_t *SduDataPtr;
    uint16_t SduLength;
} PduInfoType;</code></pre>

      <h3>本节练习</h3>
      <div class="practice">
        <ol>
          <li>写一个程序，打印 <code>a</code>、<code>&a</code>、<code>p</code>、<code>&p</code>，并用自己的话解释每一行。</li>
          <li>分别定义 <code>uint8_t *</code>、<code>uint16_t *</code>、<code>uint32_t *</code>，观察它们本身的 <code>sizeof</code> 是否相同。</li>
          <li>画一张小图：变量、地址、指针变量、指向关系。</li>
        </ol>
      </div>
    `,
    quiz: [
      {
        q: "指针变量里保存的是什么？",
        options: ["另一个对象的地址", "一定是整数 0", "函数名", "编译器版本"],
        answer: 0
      },
      {
        q: "表达式 &a 表示什么？",
        options: ["a 的值", "a 的地址", "a 的类型", "a 的大小"],
        answer: 1
      },
      {
        q: "int *p = &a; 之后，p 和 &a 的关系通常是？",
        options: ["p 保存的地址等于 a 的地址", "p 是 a 的值", "p 一定等于 10", "p 是空指针"],
        answer: 0
      },
      {
        q: "指针类型最重要的作用是什么？",
        options: ["决定变量名长度", "决定从地址处按什么类型访问，以及指针运算步长", "决定一定放入 Flash", "决定函数能不能调用"],
        answer: 1
      }
    ]
  },
  {
    id: "week2-deref",
    kicker: "第 07 节 · 解引用",
    title: "解引用：通过地址读写变量",
    summary: "*p、读写目标对象、空指针、const 指针入门",
    body: `
      <h3><code>*p</code>：顺着地址找到对象</h3>
      <p>如果 <code>p</code> 保存了 <code>a</code> 的地址，那么 <code>*p</code> 就表示“去 <code>p</code> 保存的地址那里，拿到那个对象”。这叫解引用。解引用既可以读，也可以写。</p>
      <pre><code>int a = 10;
int *p = &a;

printf("%d\\n", *p); /* 读 a，打印 10 */
*p = 20;            /* 写 a，现在 a 变成 20 */</code></pre>

      <h3>把四个表达式彻底分清</h3>
      <table class="concept-table">
        <tr><th>表达式</th><th>含义</th></tr>
        <tr><td><code>a</code></td><td>变量 a 的值</td></tr>
        <tr><td><code>&a</code></td><td>变量 a 的地址</td></tr>
        <tr><td><code>p</code></td><td>指针 p 保存的地址</td></tr>
        <tr><td><code>*p</code></td><td>p 指向的对象，也就是 a</td></tr>
      </table>

      <h3>指针必须先指向有效对象</h3>
      <p>解引用之前，指针必须保存一个有效地址。下面这种写法是危险的，因为 <code>p</code> 没有初始化，你不知道它里面是什么地址。</p>
      <pre><code>int *p;
*p = 10; /* 错误：p 没有指向有效对象 */</code></pre>

      <p>更稳的写法是先初始化为 <code>NULL_PTR</code>，使用前检查；如果要指向变量，就明确赋值为某个对象地址。</p>
      <pre><code>int a = 0;
int *p = &a;

if (p != NULL_PTR) {
    *p = 10;
}</code></pre>

      <div class="warning">
        <strong>重要：</strong>
        空指针不能解引用。<code>p == NULL_PTR</code> 时，<code>*p</code> 就是严重错误。在真实 ECU 里，这类错误可能导致 hard fault、异常复位或不可预测行为。
      </div>

      <h3>函数如何通过指针修改外部变量</h3>
      <p>C 函数参数默认是值传递。你把 <code>a</code> 传进去，函数拿到的是一份拷贝；你把 <code>&a</code> 传进去，函数拿到的是 <code>a</code> 的地址，于是可以通过这个地址修改外面的 <code>a</code>。</p>
      <pre><code>void SetTo100(int *value)
{
    if (value != NULL_PTR) {
        *value = 100;
    }
}

int a = 10;
SetTo100(&a); /* a 变成 100 */</code></pre>

      <h3>本节练习</h3>
      <div class="practice">
        <ol>
          <li>写一个 <code>SetValue(uint16_t *value, uint16_t newValue)</code>，要求检查空指针。</li>
          <li>写一个 <code>Swap(uint8_t *a, uint8_t *b)</code>，交换两个变量的值。</li>
          <li>故意写一个未初始化指针并解引用，理解为什么这是危险代码；练习时只做分析，不要在真实项目里保留这种代码。</li>
        </ol>
      </div>
    `,
    quiz: [
      {
        q: "*p 的含义是什么？",
        options: ["p 这个变量自己的地址", "p 指向的对象", "p 的类型名", "p 的大小"],
        answer: 1
      },
      {
        q: "int *p; *p = 10; 最大的问题是？",
        options: ["p 没有初始化，不知道指向哪里", "10 不能赋值", "int 不能用指针", "必须使用 float"],
        answer: 0
      },
      {
        q: "函数想修改调用者的变量，通常应该传什么？",
        options: ["变量值本身", "变量地址", "变量名字符串", "sizeof 结果"],
        answer: 1
      },
      {
        q: "解引用空指针可能导致什么？",
        options: ["正常返回 0", "严重运行时错误或异常", "自动分配内存", "编译器自动修复"],
        answer: 1
      }
    ]
  },
  {
    id: "week2-array",
    kicker: "第 08 节 · 数组与指针",
    title: "数组和指针：最容易混淆的一组关系",
    summary: "数组名退化、a[i]、p + 1、sizeof(a) 与 sizeof(p)",
    body: `
      <h3>数组是一整块连续内存</h3>
      <p><code>uint8_t data[8];</code> 表示连续 8 个字节。数组不是 8 个分散的变量，而是一段连续空间。第 0 个元素在开头，第 1 个元素紧跟后面。</p>
      <pre><code>uint8_t data[4] = { 0x11U, 0x22U, 0x33U, 0x44U };</code></pre>

      <div class="byte-row">
        <span>data[0]<strong>0x11</strong></span>
        <span>data[1]<strong>0x22</strong></span>
        <span>data[2]<strong>0x33</strong></span>
        <span>data[3]<strong>0x44</strong></span>
      </div>

      <h3>数组名什么时候像指针</h3>
      <p>在很多表达式里，数组名 <code>data</code> 会退化为指向首元素的指针，也就是 <code>&data[0]</code>。所以你常常看到这样的代码：</p>
      <pre><code>uint8_t *p = data;       /* 等价于 uint8_t *p = &data[0]; */
uint8_t first = *p;      /* 读取 data[0] */
uint8_t second = *(p+1); /* 读取 data[1] */</code></pre>

      <h3><code>p + 1</code> 不是地址数字简单加 1</h3>
      <p>指针加 1，会跳过一个“指向类型”的大小。如果 <code>p</code> 是 <code>uint8_t *</code>，<code>p + 1</code> 通常地址加 1 字节；如果 <code>p</code> 是 <code>uint32_t *</code>，<code>p + 1</code> 通常地址加 4 字节。</p>
      <pre><code>uint32_t words[3] = { 1U, 2U, 3U };
uint32_t *p = words;

/* p + 1 指向 words[1]，不是简单地只移动 1 个 bit */</code></pre>

      <h3><code>sizeof(data)</code> 和 <code>sizeof(p)</code></h3>
      <p>这是指针入门的关键分水岭。</p>
      <pre><code>uint8_t data[8];
uint8_t *p = data;

printf("%zu\\n", sizeof(data)); /* 8：整个数组大小 */
printf("%zu\\n", sizeof(p));    /* 指针变量大小，常见 4 或 8 */</code></pre>

      <div class="warning">
        <strong>注意：</strong>
        数组作为函数参数传入时，形参里的 <code>uint8_t data[]</code> 本质上是 <code>uint8_t *data</code>。所以函数内部 <code>sizeof(data)</code> 得到的是指针大小，不是原数组长度。
      </div>

      <h3>更安全的数组函数写法</h3>
      <p>函数如果接收数组，必须同时传长度。只传指针，函数不知道后面到底有多少元素。</p>
      <pre><code>uint8_t SumBytes(const uint8_t *data, uint16_t len)
{
    uint8_t sum = 0U;

    if (data != NULL_PTR) {
        for (uint16_t i = 0U; i &lt; len; i++) {
            sum = (uint8_t)(sum + data[i]);
        }
    }

    return sum;
}</code></pre>

      <h3>本节练习</h3>
      <div class="practice">
        <ol>
          <li>打印 <code>sizeof(data)</code> 和 <code>sizeof(p)</code>，解释差异。</li>
          <li>用 <code>data[i]</code> 和 <code>*(data + i)</code> 两种方式遍历数组。</li>
          <li>写一个 <code>FindByte(const uint8_t *data, uint16_t len, uint8_t target)</code>。</li>
        </ol>
      </div>
    `,
    quiz: [
      {
        q: "多数表达式中，数组名 data 会退化成什么？",
        options: ["数组长度", "指向首元素的指针", "最后一个元素", "空指针"],
        answer: 1
      },
      {
        q: "uint32_t *p; p + 1 通常移动多少字节？",
        options: ["1 字节", "2 字节", "4 字节", "取决于变量名长度"],
        answer: 2
      },
      {
        q: "在函数参数 uint8_t data[] 内部 sizeof(data) 通常得到什么？",
        options: ["原数组总长度", "指针变量大小", "数组元素个数", "一定是 0"],
        answer: 1
      },
      {
        q: "接收 buffer 的函数为什么要同时传 len？",
        options: ["因为指针本身不知道 buffer 长度", "因为 len 可以让代码更慢", "因为 C 不支持数组", "因为 uint8_t 不能比较"],
        answer: 0
      }
    ]
  },
  {
    id: "week2-params",
    kicker: "第 09 节 · 指针参数",
    title: "函数参数里的指针：输入、输出、输入输出",
    summary: "const 输入指针、输出参数、返回值、AUTOSAR 接口习惯",
    body: `
      <h3>指针参数先判断方向</h3>
      <p>看到一个指针参数时，先问：这个指针指向的数据是给函数读取的，还是让函数写结果的，还是既读又写？这个问题比语法更重要。</p>
      <table class="concept-table">
        <tr><th>方向</th><th>推荐写法</th><th>含义</th></tr>
        <tr><td>输入</td><td><code>const uint8_t *src</code></td><td>函数只读，不应该改</td></tr>
        <tr><td>输出</td><td><code>uint8_t *dst</code></td><td>函数会写入结果</td></tr>
        <tr><td>输入输出</td><td><code>uint16_t *value</code></td><td>函数先读，再更新</td></tr>
      </table>

      <h3>为什么输入指针要加 <code>const</code></h3>
      <p><code>const uint8_t *src</code> 表示函数不会通过 <code>src</code> 修改它指向的数据。这样调用者更安心，编译器也能帮你拦住误写。</p>
      <pre><code>Std_ReturnType CheckHeader(const uint8_t *data, uint16_t len)
{
    Std_ReturnType ret = E_NOT_OK;

    if ((data != NULL_PTR) && (len &gt;= 2U)) {
        if ((data[0] == 0x10U) && (data[1] == 0x03U)) {
            ret = E_OK;
        }
    }

    return ret;
}</code></pre>

      <h3>输出参数必须说明 buffer 大小</h3>
      <p>只给一个 <code>uint8_t *dst</code>，函数不知道能写几个字节。安全写法是同时传入 <code>dstSize</code>，写之前检查容量。</p>
      <pre><code>Std_ReturnType BuildPositiveResponse(uint8_t *dst, uint16_t dstSize, uint16_t *outLen)
{
    Std_ReturnType ret = E_NOT_OK;

    if ((dst != NULL_PTR) && (outLen != NULL_PTR) && (dstSize &gt;= 2U)) {
        dst[0] = 0x50U;
        dst[1] = 0x03U;
        *outLen = 2U;
        ret = E_OK;
    }

    return ret;
}</code></pre>

      <h3>AUTOSAR 风格接口为什么常用返回值 + 输出参数</h3>
      <p>很多嵌入式接口不会返回复杂对象，而是返回 <code>E_OK</code> / <code>E_NOT_OK</code> 表示函数执行是否成功，真正的数据通过输出指针带出去。这样便于错误处理，也便于避免动态内存。</p>

      <div class="note">
        <strong>读接口口诀：</strong>
        带 <code>const</code> 多半是输入；非 <code>const</code> 指针可能会被写；如果还有长度参数，通常是在保护 buffer 边界；如果还有 <code>outLen</code>，说明函数会告诉你实际写了多少。
      </div>

      <h3>本节练习</h3>
      <div class="practice">
        <ol>
          <li>写 <code>ReadU16BigEndian(const uint8_t *data, uint16_t len, uint16_t *value)</code>。</li>
          <li>写 <code>WriteU16BigEndian(uint8_t *data, uint16_t len, uint16_t value)</code>。</li>
          <li>给每个指针参数标注方向：输入、输出、输入输出。</li>
        </ol>
      </div>
    `,
    quiz: [
      {
        q: "const uint8_t *src 通常表示什么？",
        options: ["src 只能作为输出", "函数不应通过 src 修改数据", "src 一定是空指针", "src 指向 Flash 地址 0"],
        answer: 1
      },
      {
        q: "输出 buffer 参数为什么通常需要 dstSize？",
        options: ["为了检查容量，避免越界写", "为了让函数名更长", "为了让编译器报错", "因为指针不能写数据"],
        answer: 0
      },
      {
        q: "Std_ReturnType + 输出指针这种接口风格的好处是？",
        options: ["能表达成功失败，同时通过指针带出数据", "一定比所有代码都快", "可以不用检查空指针", "可以无限写入 buffer"],
        answer: 0
      },
      {
        q: "uint16_t *outLen 在 BuildPositiveResponse 里通常属于什么方向？",
        options: ["输入", "输出", "只读配置", "函数名"],
        answer: 1
      }
    ]
  },
  {
    id: "week2-danger",
    kicker: "第 10 节 · 指针综合",
    title: "危险指针和阶段综合练习",
    summary: "野指针、悬空指针、越界、NULL、buffer 项目",
    body: `
      <h3>指针最常见的四类危险</h3>
      <p>你说自己指针基础薄弱，这一节尤其重要。很多 C 代码事故不是因为复杂算法，而是因为指针没有指向有效对象、指向的对象已经失效、访问越界，或者没有检查空指针。</p>

      <h3>1. 未初始化指针</h3>
      <pre><code>uint8_t *p;
*p = 1U; /* 危险：p 里是未知地址 */</code></pre>
      <p>修正方式：定义时初始化；不知道指向谁时，先设为 <code>NULL_PTR</code>；使用前检查。</p>

      <h3>2. 空指针解引用</h3>
      <pre><code>uint8_t *p = NULL_PTR;
*p = 1U; /* 错误 */</code></pre>
      <p>修正方式：所有外部传入的指针，除非接口明确保证，否则使用前检查。</p>

      <h3>3. 悬空指针</h3>
      <p>指针曾经指向有效对象，但对象生命周期结束后，指针还在被使用。</p>
      <pre><code>uint8_t *BadReturn(void)
{
    uint8_t local = 10U;
    return &local; /* 错误：local 返回后失效 */
}</code></pre>

      <h3>4. 数组越界</h3>
      <pre><code>uint8_t data[8];
data[8] = 0xAAU; /* 错误：最后一个有效下标是 7 */</code></pre>
      <p>修正方式：所有循环条件和长度检查都要明确。嵌入式里越界写可能破坏旁边的变量、栈帧、函数返回地址或通信 buffer。</p>

      <div class="warning">
        <strong>工程习惯：</strong>
        写任何接收指针的函数时，先写空指针检查；写任何访问数组的代码时，先写长度检查。这个习惯比记住很多语法细节更重要。
      </div>

      <h3>阶段综合项目：Pdu Buffer 小模块</h3>
      <p>这个小项目贴近 AUTOSAR 通信栈里的 buffer 操作，目的是把指针、数组、长度和返回值串起来。</p>
      <pre><code>section06_10_pointer_project/
  Std_Types.h
  PduBuffer.h
  PduBuffer.c
  main.c</code></pre>

      <p>实现这些接口：</p>
      <pre><code>Std_ReturnType PduBuffer_Copy(
    uint8_t *dst,
    uint16_t dstSize,
    const uint8_t *src,
    uint16_t srcLen,
    uint16_t *copiedLen
);

Std_ReturnType PduBuffer_ReadU16(
    const uint8_t *data,
    uint16_t len,
    uint16_t offset,
    uint16_t *value
);

Std_ReturnType PduBuffer_WriteU16(
    uint8_t *data,
    uint16_t len,
    uint16_t offset,
    uint16_t value
);</code></pre>

      <h3>验收标准</h3>
      <ul>
        <li>所有指针参数使用前检查 <code>NULL_PTR</code>。</li>
        <li>所有数组访问前检查长度，尤其是 <code>offset + 1U</code> 这种位置。</li>
        <li>输入 buffer 使用 <code>const uint8_t *</code>。</li>
        <li>返回 <code>E_OK</code> 表示成功，<code>E_NOT_OK</code> 表示失败。</li>
        <li>写完后逐行解释：每个指针指向谁，每次 <code>*</code> 是读还是写。</li>
      </ul>

      <h3>复盘问题</h3>
      <div class="practice">
        <ol>
          <li><code>dst</code> 和 <code>src</code> 的方向分别是什么？</li>
          <li>为什么 <code>src</code> 要加 <code>const</code>？</li>
          <li><code>copiedLen</code> 为什么需要检查空指针？</li>
          <li><code>offset + 1U</code> 访问前应该怎样检查，才能避免越界？</li>
        </ol>
      </div>
    `,
    quiz: [
      {
        q: "返回局部变量地址的问题是什么？",
        options: ["局部变量返回后生命周期结束，地址失效", "局部变量不能有地址", "函数不能返回任何值", "uint8_t 不能放栈上"],
        answer: 0
      },
      {
        q: "uint8_t data[8]; 最后一个有效下标是？",
        options: ["6", "7", "8", "9"],
        answer: 1
      },
      {
        q: "外部传入的指针使用前通常应该先做什么？",
        options: ["检查是否为 NULL_PTR", "直接解引用", "转换成 float", "打印函数名"],
        answer: 0
      },
      {
        q: "PduBuffer_Copy 里的 src 推荐类型是？",
        options: ["const uint8_t *", "uint8_t", "float *", "uint8_t ** 且不检查"],
        answer: 0
      },
      {
        q: "数组越界写在嵌入式里为什么危险？",
        options: ["可能破坏其他内存，导致异常或隐蔽错误", "只会自动忽略", "一定会编译失败", "只影响注释"],
        answer: 0
      }
    ]
  },
  {
    id: "week3-struct",
    kicker: "第 11 节 · 结构体",
    title: "结构体：把不同类型的数据打包在一起",
    summary: "struct 定义、typedef、访问、初始化、嵌套结构体",
    body: `
      <h3>为什么嵌入式里离不开结构体</h3>
      <p>AUTOSAR 代码里到处都是结构体：CAN 报文结构、PDU 信息结构、DID 配置表、寄存器映射、错误码结构……结构体让你把<strong>逻辑上属于同一事物的数据</strong>打包在一起，而不是用一堆分散的全局变量。</p>

      <h3>基本定义和 typedef</h3>
      <pre><code>typedef struct {
    uint32_t id;
    uint8_t  dlc;
    uint8_t  data[8];
} CanPduType;</code></pre>
      <p>这里 <code>typedef</code> 的意思是：以后直接用 <code>CanPduType</code> 就能声明变量，不需要每次都写 <code>struct</code>。嵌入式里几乎总是配合 <code>typedef</code> 使用。</p>

      <h3>访问成员</h3>
      <pre><code>CanPduType pdu;
pdu.id  = 0x123U;
pdu.dlc = 8U;
pdu.data[0] = 0xAAU;</code></pre>
      <p>用点号 <code>.</code> 访问成员。如果是指向结构体的指针，用箭头 <code>-></code>。</p>
      <pre><code>CanPduType *pPdu = &pdu;
pPdu->id = 0x123U;   /* 等价于 (*pPdu).id */</code></pre>

      <h3>初始化方式</h3>
      <pre><code>CanPduType pdu = {
    .id  = 0x123U,
    .dlc = 8U,
    .data = { 0xAAU, 0xBBU }
};</code></pre>
      <p>C99 指定初始化（<code>.member = value</code>）在嵌入式里非常推荐，因为可读性好、不容易错位，而且不受字段顺序影响。</p>

      <div class="note">
        <strong>工程直觉：</strong>
        看到结构体定义时，先问自己：每个字段占多少字节？整个结构体 sizeof 是多少？有没有 padding？字段顺序会不会影响大小？
      </div>

      <h3>本节练习</h3>
      <div class="practice">
        <ol>
          <li>定义一个 <code>DidConfigType</code>，包含 <code>uint16_t did</code>、<code>uint8_t length</code>、<code>uint8_t data[8]</code>。</li>
          <li>用指定初始化创建两个配置项，然后打印 <code>sizeof(DidConfigType)</code>。</li>
          <li>写一个函数 <code>DidConfig_GetLength(const DidConfigType *config)</code>，返回 length，要求检查空指针。</li>
        </ol>
      </div>
    `,
    quiz: [
      {
            "q": "typedef struct { ... } CanPduType; 中 typedef 的主要作用是？",
            "options": [
                  "让结构体运行更快",
                  "以后可以直接用 CanPduType 声明变量",
                  "隐藏结构体内部字段",
                  "让结构体变成联合体"
            ],
            "answer": 1
      },
      {
            "q": "指向结构体的指针 pPdu，访问成员 id 的正确写法是？",
            "options": [
                  "pPdu.id",
                  "pPdu->id",
                  "pPdu[id]",
                  "pPdu::id"
            ],
            "answer": 1
      },
      {
            "q": "C99 指定初始化 .id = 0x123U 的好处不包括？",
            "options": [
                  "不受字段顺序影响",
                  "可读性好",
                  "自动编译通过",
                  "不容易错位"
            ],
            "answer": 2
      },
      {
            "q": "const DidConfigType *config 作为参数时，函数可以做什么？",
            "options": [
                  "修改 config 指向的对象",
                  "修改 config 指针本身",
                  "读取 config 的成员但不能修改",
                  "删除 config 的内存"
            ],
            "answer": 2
      }
]
  },
  {
    id: "week3-union",
    kicker: "第 12 节 · 联合体",
    title: "联合体：共享同一块内存的多种解释方式",
    summary: "union 定义、大小端、字节访问、协议解析中的实际用途",
    body: `
      <h3>联合体最朴素的理解</h3>
      <p>结构体给每个成员<strong>各分配</strong>一块内存；联合体给所有成员<strong>共享同一块</strong>内存。联合体的大小等于<strong>最大成员</strong>的大小。</p>

      <pre><code>typedef union {
    uint32_t word;
    uint8_t  bytes[4];
} U32AccessType;</code></pre>
      <p>这个联合体占 4 个字节。你可以通过 <code>word</code> 按 32 位读写，也可以通过 <code>bytes[0]~bytes[3]</code> 按字节逐个访问。二者指向的是同一块物理内存。</p>

      <h3>大小端与联合体</h3>
      <p>在小端机器上（如大多数 ARM Cortex-M），<code>bytes[0]</code> 是低字节；在大端机器上，<code>bytes[0]</code> 是高字节。联合体本身不处理大小端，它只是给你一种"按字节拆 32 位数"的便捷方式。</p>

      <pre><code>U32AccessType u;
u.word = 0x12345678U;
/* 小端：u.bytes[0] = 0x78, u.bytes[1] = 0x56 */</code></pre>

      <div class="warning">
        <strong>注意：</strong>
        读取一个联合体成员时，只有最近一次写入的那个成员的值是确定有效的。如果先写 <code>word</code> 再读 <code>bytes</code>，在 C 标准中属于"类型双关"（type punning），虽然在常见嵌入式编译器上通常工作，但严格来说不是标准保证的行为。工程中要确认编译器支持再使用。
      </div>

      <h3>AUTOSAR 里的典型用途</h3>
      <p>联合体常用于协议解析：报文既想按 32 位寄存器读写，又想按字节解析。也用于配置表：同一个表项在不同条件下代表不同含义。</p>

      <h3>本节练习</h3>
      <div class="practice">
        <ol>
          <li>定义一个 <code>RegAccessType</code> union，包含 <code>uint32_t word</code> 和 <code>uint8_t bytes[4]</code>。</li>
          <li>写一个函数 <code>GetU32Byte(uint32_t value, uint8_t index)</code>，用联合体取出指定字节。</li>
          <li>思考：为什么 <code>sizeof(RegAccessType)</code> 通常等于 4 而不是 5？</li>
        </ol>
      </div>
    `,
    quiz: [
      {
            "q": "联合体 union 的大小等于？",
            "options": [
                  "所有成员大小之和",
                  "最大成员的大小",
                  "第一个成员的大小",
                  "固定 4 字节"
            ],
            "answer": 1
      },
      {
            "q": "union { uint32_t word; uint8_t bytes[4]; } 中，word 和 bytes 的关系是？",
            "options": [
                  "各自独立的内存",
                  "共享同一块 4 字节内存",
                  "bytes 在 word 后面",
                  "编译器自动选择"
            ],
            "answer": 1
      },
      {
            "q": "在小端平台上，uint32_t 值为 0x12345678，低字节是？",
            "options": [
                  "0x12",
                  "0x34",
                  "0x56",
                  "0x78"
            ],
            "answer": 3
      },
      {
            "q": "联合体在 AUTOSAR 里的典型用途是？",
            "options": [
                  "动态分配内存",
                  "同一块内存按不同方式解释",
                  "自动处理多线程",
                  "替代指针运算"
            ],
            "answer": 1
      }
]
  },
  {
    id: "week3-bitfield",
    kicker: "第 13 节 · 位域",
    title: "位域：精确控制每个 bit 的含义",
    summary: "bit-field 定义、布局、对齐陷阱、寄存器位域映射",
    body: `
      <h3>为什么嵌入式需要位域</h3>
      <p>硬件寄存器常常把 32 位拆成多个功能位：低 8 位是设备 ID，接下来 4 位是模式，再 4 位是状态标志……位域让你用结构体的语法<strong>直接映射到具体的 bit 位</strong>。</p>

      <pre><code>typedef struct {
    uint32_t deviceId : 8;
    uint32_t mode     : 4;
    uint32_t flags    : 4;
    uint32_t reserved : 16;
} RegBitFieldType;</code></pre>
      <p>冒号后面的数字表示这个字段占多少 bit。上面的定义把 32 位寄存器按语义切分，代码可读性比用掩码和移位好得多。</p>

      <h3>位域的大小和布局</h3>
      <p>位域的总大小等于底层类型的大小（这里 <code>uint32_t</code> 是 4 字节）。字段在内存中的排列顺序（从高位到低位还是从低位到高位）<strong>由编译器决定</strong>，C 标准没有统一规定。所以位域代码通常<strong>和编译器绑定</strong>。</p>

      <div class="warning">
        <strong>常见坑：</strong>
        位域不能取地址（<code>&reg.mode</code> 是非法的）。不要试图把位域成员传给指针参数。另外，位域的跨编译器可移植性很差，同一个定义在 GCC 和 IAR 上可能布局不同。
      </div>

      <h3>AUTOSAR 中的典型用法</h3>
      <p>状态寄存器映射、配置字解析、通信协议中的标志位字段，都常用位域。但 AUTOSAR 规范（如 MISRA-C）对位域使用有一些限制，比如不建议位域成员跨越类型边界。</p>

      <h3>本节练习</h3>
      <div class="practice">
        <ol>
          <li>定义一个 16 位寄存器位域：<code>enable:1</code>、<code>mode:3</code>、<code>status:4</code>、<code>reserved:8</code>。</li>
          <li>写代码设置 <code>enable = 1</code>、<code>mode = 2</code>，然后打印整个结构体的值。</li>
          <li>验证 <code>sizeof</code> 是否等于 2 字节（底层类型是 uint16_t）。</li>
        </ol>
      </div>
    `,
    quiz: [
      {
            "q": "uint32_t mode : 4; 中 : 4 表示什么？",
            "options": [
                  "mode 占 4 个字节",
                  "mode 占 4 个 bit",
                  "mode 取值范围是 0~4",
                  "mode 是第 4 个字段"
            ],
            "answer": 1
      },
      {
            "q": "位域的总大小通常等于？",
            "options": [
                  "所有 bit 之和除以 8",
                  "底层类型的大小（如 uint32_t 就是 4 字节）",
                  "编译器自动决定",
                  "固定 1 字节"
            ],
            "answer": 1
      },
      {
            "q": "位域的主要可移植性风险是？",
            "options": [
                  "字段顺序和布局由编译器决定",
                  "不能用于 32 位系统",
                  "一定比掩码运算慢",
                  "不支持 uint8_t 类型"
            ],
            "answer": 0
      },
      {
            "q": "位域成员不能做什么？",
            "options": [
                  "赋值",
                  "比较",
                  "取地址（&）",
                  "作为函数返回值"
            ],
            "answer": 2
      }
]
  },
  {
    id: "week3-alignment",
    kicker: "第 14 节 · 对齐与布局",
    title: "内存对齐与填充：sizeof 为什么不等于字段之和",
    summary: "自然对齐、padding、packed 属性、编译器差异、MISRA 限制",
    body: `
      <h3>sizeof 的意外</h3>
      <p>下面这个结构体，你直觉上觉得它占多少字节？</p>
      <pre><code>typedef struct {
    uint8_t  a;
    uint32_t b;
    uint8_t  c;
} SampleType;</code></pre>
      <p>1 + 4 + 1 = 6？不对。在大多数 32 位平台上，<code>sizeof(SampleType)</code> 等于 <strong>12</strong>。原因是<strong>内存对齐</strong>：编译器会在字段之间插入不可见的 padding，让每个字段的起始地址满足其自身对齐要求。</p>

      <h3>自然对齐规则</h3>
      <p>一个 N 字节类型的变量，通常要求地址是 N 的倍数。比如 <code>uint32_t</code> 要求 4 字节对齐，所以编译器在 <code>a</code>（1 字节）后面插入 3 字节 padding，让 <code>b</code> 从地址 4 开始。</p>

      <div class="note">
        <strong>优化技巧：</strong>
        把大字段放前面、小字段放后面，通常能减少 padding。比如 <code>uint32_t, uint16_t, uint8_t</code> 的顺序通常比反过来的顺序更紧凑。
      </div>

      <h3>packed 属性</h3>
      <p>如果你需要严格按字段顺序排列、不插入 padding，可以用编译器扩展：</p>
      <pre><code>typedef struct __attribute__((packed)) {
    uint8_t  a;
    uint32_t b;
    uint8_t  c;
} PackedType;  /* sizeof 通常等于 6 */</code></pre>
      <p>但 packed 结构体访问非对齐字段可能降低性能，有些 CPU 甚至不支持非对齐访问。嵌入式里要谨慎使用。</p>

      <h3>MISRA 限制</h3>
      <p>MISRA-C 对位域和结构体使用有一些限制，比如位域应使用明确的无符号类型，不建议位域跨越类型边界。结构体定义应尽量跨编译器可移植。</p>

      <h3>本节练习</h3>
      <div class="practice">
        <ol>
          <li>定义一个含 <code>uint8_t</code>、<code>uint32_t</code>、<code>uint8_t</code> 的结构体，打印 <code>sizeof</code> 并解释 padding。</li>
          <li>调整字段顺序，重新打印 <code>sizeof</code>，观察变化。</li>
          <li>用 <code>__attribute__((packed))</code> 定义同一结构体，对比 <code>sizeof</code>。</li>
        </ol>
      </div>
    `,
    quiz: [
      {
            "q": "struct { uint8_t a; uint32_t b; uint8_t c; } 通常 sizeof 大于 6 的原因是？",
            "options": [
                  "字段顺序错了",
                  "编译器插入 padding 保证对齐",
                  "uint32_t 一定是 8 字节",
                  "结构体有额外头部"
            ],
            "answer": 1
      },
      {
            "q": "减少 padding 的常见技巧是？",
            "options": [
                  "大字段放前面、小字段放后面",
                  "全部用 uint8_t",
                  "删除 typedef",
                  "增加字段"
            ],
            "answer": 0
      },
      {
            "q": "__attribute__((packed)) 的主要风险是？",
            "options": [
                  "代码变长",
                  "编译器不识别",
                  "非对齐访问可能降低性能或触发异常",
                  "结构体不能初始化"
            ],
            "answer": 2
      },
      {
            "q": "MISRA 对位域和结构体的主要关注点是什么？",
            "options": [
                  "可移植性和明确类型",
                  "必须用最少的内存",
                  "不能嵌套",
                  "必须按字母顺序排列"
            ],
            "answer": 0
      }
]
  },
  {
    id: "week3-review",
    kicker: "第 15 节 · 内存布局综合",
    title: "把结构体、联合体、位域和对齐串起来",
    summary: "阶段综合：实现一个寄存器配置解析器小模块",
    body: `
      <h3>本阶段核心目标</h3>
      <p>第 11-15 节的核心不是记住语法，而是建立<strong>内存布局直觉</strong>：看到结构体就想到 sizeof 和 padding；看到联合体就想到共享内存；看到位域就想到编译器依赖；看到对齐就想到字段顺序影响。</p>

      <h3>阶段综合项目：寄存器配置解析器</h3>
      <p>模拟一个 AUTOSAR 通信模块的寄存器配置，需要同时用到结构体、联合体和位域。</p>
      <pre><code>section11_15_project/
  RegConfig.h
  RegConfig.c
  main.c</code></pre>

      <p><code>RegConfig.h</code> 定义：</p>
      <pre><code>typedef union {
    uint32_t raw;
    struct {
        uint32_t enable   : 1;
        uint32_t mode     : 3;
        uint32_t prescale : 8;
        uint32_t reserved : 20;
    } bits;
} RegControlType;</code></pre>

      <h3>实现要求</h3>
      <ul>
        <li>提供 <code>RegControl_SetMode(uint32_t *reg, uint8_t mode)</code>。</li>
        <li>提供 <code>RegControl_GetPrescale(uint32_t reg)</code>。</li>
        <li>所有函数检查空指针（如果适用）。</li>
        <li>用联合体访问寄存器，既可以用 <code>.bits</code> 语义访问，也可以直接读写 <code>.raw</code>。</li>
        <li>打印 <code>sizeof(RegControlType)</code> 并解释为什么。</li>
      </ul>

      <div class="warning">
        <strong>工程习惯：</strong>
        写位域前确认编译器文档中对位域布局的定义。如果不确定，可以用掩码和移位替代，牺牲一点可读性换取可移植性。
      </div>

      <h3>复盘问题</h3>
      <ol>
        <li>RegControlType 的 sizeof 是多少？为什么不是 1+3+8+20=32 bit 的精确值？</li>
        <li>联合体 .bits 和 .raw 之间的关系是什么？</li>
        <li>如果把这个定义移植到另一个编译器，最可能出问题的是什么？</li>
      </ol>
    `,
    quiz: [
      {
            "q": "union { uint32_t raw; struct { ... } bits; } 的主要用途是？",
            "options": [
                  "节省内存",
                  "同一块内存既按位域语义访问又按整字访问",
                  "自动处理中断",
                  "替代动态内存"
            ],
            "answer": 1
      },
      {
            "q": "sizeof(RegControlType) 通常等于？",
            "options": [
                  "4 字节（底层类型 uint32_t）",
                  "字段 bit 之和除以 8",
                  "1 字节",
                  "编译器随机决定"
            ],
            "answer": 0
      },
      {
            "q": "位域定义跨编译器移植时最可能出问题的是？",
            "options": [
                  "字段顺序和布局",
                  "字段名称",
                  "底层类型",
                  "sizeof 运算"
            ],
            "answer": 0
      },
      {
            "q": "第 11-15 节的核心不是背语法，而是建立什么？",
            "options": [
                  "内存布局直觉",
                  "绘图能力",
                  "网络编程",
                  "数据库设计"
            ],
            "answer": 0
      },
      {
            "q": "如果位域可移植性不确定，工程上更稳的做法是？",
            "options": [
                  "用掩码和移位替代",
                  "换编译器",
                  "不用结构体",
                  "用 float"
            ],
            "answer": 0
      }
]
  },
  {
    id: "week4-function-interface",
    kicker: "第 16 节 · 函数接口",
    title: "函数接口：输入、输出、返回值和副作用",
    summary: "函数原型、参数方向、输出指针、返回值、接口契约",
    body: `
      <h3>为什么这一节先讲函数接口</h3>
      <p>在 AUTOSAR 项目里，你写的不是一个孤立的 <code>main</code>，而是一堆被 RTE、BSW、上层模块调用的函数。函数接口就是模块之间的合同：调用者给什么，函数能改什么，失败时怎么返回，输出结果放在哪里。</p>
      <p>很多 C 初学者会把函数写成“能跑就行”，但嵌入式项目更关心<strong>接口边界是否清楚</strong>。一个好的接口，别人只看函数原型就能知道参数方向和错误处理方式。</p>

      <h3>先分清输入、输出和输入输出</h3>
      <ul>
        <li><code>const uint8_t *src</code>：输入 buffer，函数只读，不应该修改。</li>
        <li><code>uint8_t *dst</code>：输出 buffer，函数会写入。</li>
        <li><code>uint16_t *length</code>：输出参数或输入输出参数，具体要看接口说明。</li>
        <li><code>Std_ReturnType</code>：返回 <code>E_OK</code> 或 <code>E_NOT_OK</code>，表示函数是否成功。</li>
      </ul>

      <pre><code>Std_ReturnType Did_Read(
    uint16_t did,
    uint8_t *data,
    uint16_t dataSize,
    uint16_t *actualLen
);</code></pre>

      <p>这个接口的含义应该这样读：调用者给一个 DID，提供一个可写 buffer 和 buffer 容量；函数把读到的数据写进 <code>data</code>，把实际长度写进 <code>actualLen</code>，最后用返回值告诉调用者成功还是失败。</p>

      <h3>接口里的副作用</h3>
      <p>副作用就是函数除了返回值以外，还改变了外部状态。比如写输出指针、修改全局变量、访问寄存器、发送报文、清除错误标志，这些都属于副作用。嵌入式 C 里副作用不可避免，但必须让它<strong>可见、可控、可测试</strong>。</p>

      <div class="note">
        <strong>接口阅读顺序：</strong>
        先看返回值，再看每个指针是否为 const，再看长度参数，再看函数名动词。这样你能快速判断它是读、写、查找、转换，还是触发硬件动作。
      </div>

      <h3>AUTOSAR 风格返回值</h3>
      <pre><code>#define E_OK     0U
#define E_NOT_OK 1U
typedef uint8_t Std_ReturnType;</code></pre>
      <p>返回值只表达“本次调用是否成功”。真正的数据通常通过输出指针带出。这样做的好处是接口风格统一，调用者可以用同一种模式处理错误。</p>

      <h3>本节练习</h3>
      <div class="practice">
        <ol>
          <li>写一个 <code>Did_CopyValue</code> 函数，把输入数据复制到输出 buffer。</li>
          <li>要求检查 <code>src</code>、<code>dst</code>、<code>actualLen</code> 是否为空。</li>
          <li>要求检查 <code>srcLen <= dstSize</code>，避免越界写。</li>
          <li>成功时写入 <code>*actualLen</code>，返回 <code>E_OK</code>；失败时返回 <code>E_NOT_OK</code>。</li>
        </ol>
      </div>
    `,
    quiz: [
      {
        q: "函数参数 const uint8_t *src 通常表示什么？",
        options: ["输入数据，只读不改", "输出数据，必须写", "函数名", "动态内存"],
        answer: 0
      },
      {
        q: "Std_ReturnType 在 AUTOSAR 风格接口里常用来表示什么？",
        options: ["函数执行成功或失败", "输出 buffer 地址", "数组长度单位", "CPU 频率"],
        answer: 0
      },
      {
        q: "输出指针 actualLen 使用前必须先做什么？",
        options: ["检查是否为空指针", "强制转换成 uint8_t", "写入 0xFF", "声明成 static"],
        answer: 0
      },
      {
        q: "srcLen <= dstSize 这个检查主要防止什么？",
        options: ["输出 buffer 越界写", "函数名重复", "编译器优化", "指针变成数组"],
        answer: 0
      },
      {
        q: "函数副作用指的是什么？",
        options: ["函数改变外部可见状态", "函数没有返回值", "函数写了注释", "函数用了 typedef"],
        answer: 0
      }
    ]
  },
  {
    id: "week4-header-source",
    kicker: "第 17 节 · 头文件和源文件",
    title: "头文件和源文件：把模块边界写清楚",
    summary: ".h/.c 拆分、声明和定义、include guard、static 内部函数",
    body: `
      <h3>.h 和 .c 分别放什么</h3>
      <p>一个 C 模块通常由头文件和源文件组成。头文件 <code>.h</code> 是给别人看的接口，源文件 <code>.c</code> 是模块自己的实现。把这两者分清楚，是从“写小程序”走向“写工程代码”的关键一步。</p>

      <ul>
        <li><code>.h</code>：类型定义、宏、公开函数声明、必要的外部接口。</li>
        <li><code>.c</code>：函数实现、私有全局变量、私有辅助函数。</li>
        <li>不希望外部调用的函数，放在 <code>.c</code> 里并加 <code>static</code>。</li>
        <li>全局变量定义只放在一个 <code>.c</code> 里，头文件里最多放 <code>extern</code> 声明。</li>
      </ul>

      <h3>include guard</h3>
      <p>头文件可能被多个文件反复包含，所以必须防止重复展开。传统写法是 include guard：</p>
      <pre><code>#ifndef DID_SERVICE_H
#define DID_SERVICE_H

#include &lt;stdint.h&gt;

Std_ReturnType DidService_Read(uint16_t did, uint8_t *data, uint16_t size);

#endif /* DID_SERVICE_H */</code></pre>

      <p>它的意思是：如果 <code>DID_SERVICE_H</code> 还没有定义，就展开头文件内容，并定义这个宏；如果已经定义过，就跳过。这样可以避免类型重复定义、函数声明重复展开带来的问题。</p>

      <h3>声明和定义不是一回事</h3>
      <pre><code>/* 声明：告诉编译器有这个函数 */
Std_ReturnType DidService_Init(void);

/* 定义：真正实现函数体 */
Std_ReturnType DidService_Init(void)
{
    return E_OK;
}</code></pre>
      <p>声明可以出现多次，定义通常只能出现一次。链接阶段会把调用点和函数定义连接起来。如果有声明但没有定义，链接时会报 undefined reference；如果定义重复，链接时会报 multiple definition。</p>

      <h3>static 内部函数</h3>
      <p><code>static</code> 修饰全局函数时，表示这个函数只在当前 <code>.c</code> 文件里可见。AUTOSAR 模块里很常见：公开函数负责接口，内部函数负责拆分细节。</p>

      <div class="warning">
        <strong>常见错误：</strong>
        把函数实现写进头文件，或者在头文件里定义普通全局变量。这样多个 <code>.c</code> 同时包含时，容易造成重复定义。
      </div>

      <h3>本节练习</h3>
      <div class="practice">
        <ol>
          <li>设计 <code>DidService.h</code>，包含 include guard 和公开函数声明。</li>
          <li>设计 <code>DidService.c</code>，实现公开函数，并写一个 <code>static</code> 内部查表函数。</li>
          <li>解释哪些内容属于公开接口，哪些内容属于私有实现。</li>
        </ol>
      </div>
    `,
    quiz: [
      {
        q: ".h 文件主要放什么？",
        options: ["公开接口声明和类型定义", "所有函数实现", "编译器输出", "运行日志"],
        answer: 0
      },
      {
        q: "include guard 的作用是什么？",
        options: ["防止头文件内容被重复展开", "提升 CPU 频率", "自动分配内存", "替代链接脚本"],
        answer: 0
      },
      {
        q: "static 修饰全局函数时表示什么？",
        options: ["只在当前 .c 文件内部可见", "函数运行更快", "函数不能被调用", "函数返回 static"],
        answer: 0
      },
      {
        q: "有声明但没有定义，通常在哪个阶段报错？",
        options: ["链接阶段", "预处理阶段", "运行 1 小时后", "注释阶段"],
        answer: 0
      },
      {
        q: "为什么不建议在头文件里定义普通全局变量？",
        options: ["多个 .c 包含后可能重复定义", "变量不能有名字", "头文件不能包含数字", "会让 const 失效"],
        answer: 0
      }
    ]
  },
  {
    id: "week4-macro-preprocess",
    kicker: "第 18 节 · 预处理和宏",
    title: "预处理和宏：编译前发生了什么",
    summary: "#define、条件编译、函数式宏、宏副作用、配置开关",
    body: `
      <h3>预处理是什么</h3>
      <p>C 编译前会先经过预处理阶段。预处理器会处理 <code>#include</code>、<code>#define</code>、<code>#if</code>、<code>#ifdef</code> 这些指令，然后把结果交给编译器。AUTOSAR 项目里大量配置开关、内存映射、编译器适配都依赖预处理。</p>

      <h3>对象式宏</h3>
      <pre><code>#define DID_MAX_LEN 8U
#define DEM_EVENT_STATUS_FAILED 1U</code></pre>
      <p>对象式宏只是简单替换。推荐给宏值加类型后缀，比如 <code>8U</code>，明确它是无符号常量。</p>

      <h3>函数式宏和括号</h3>
      <pre><code>#define MIN_U16(a, b) (((a) < (b)) ? (a) : (b))</code></pre>
      <p>宏没有类型检查，只是文本替换。参数和整体表达式都要加括号，否则遇到复杂表达式时容易出错。</p>

      <div class="warning">
        <strong>宏副作用：</strong>
        不要把 <code>i++</code> 传给可能多次使用参数的宏。例如 <code>MIN_U16(i++, limit)</code> 可能让 <code>i</code> 增加不止一次。
      </div>

      <h3>条件编译</h3>
      <pre><code>#if (DID_SERVICE_ENABLE == STD_ON)
Std_ReturnType DidService_Read(uint16_t did, uint8_t *data, uint16_t size);
#endif</code></pre>
      <p>条件编译可以根据配置决定某段代码是否参与编译。它和普通 <code>if</code> 不同：普通 <code>if</code> 是运行时选择，条件编译是编译前选择，未启用的代码根本不会进入编译器。</p>

      <h3>AUTOSAR 常见宏风格</h3>
      <ul>
        <li><code>STD_ON</code> / <code>STD_OFF</code>：配置开关。</li>
        <li><code>NULL_PTR</code>：空指针宏。</li>
        <li><code>FUNC</code>、<code>P2VAR</code>、<code>P2CONST</code>：用于编译器抽象和内存映射。</li>
        <li><code>DET</code>、<code>DEM</code> 相关宏：错误检测和诊断事件配置。</li>
      </ul>

      <h3>本节练习</h3>
      <div class="practice">
        <ol>
          <li>写一个 <code>CLAMP_U16(value, min, max)</code> 宏，要求参数都加括号。</li>
          <li>写一个配置开关 <code>DID_DEV_ERROR_DETECT</code>，启用时调用错误上报函数。</li>
          <li>解释为什么函数式宏不应该接收带副作用的表达式。</li>
        </ol>
      </div>
    `,
    quiz: [
      {
        q: "预处理发生在什么时候？",
        options: ["编译前", "程序运行 10 秒后", "链接完成后", "下载到芯片后"],
        answer: 0
      },
      {
        q: "函数式宏为什么要给参数加括号？",
        options: ["避免表达式优先级错误", "让变量变成全局变量", "减少 ROM", "自动检查类型"],
        answer: 0
      },
      {
        q: "条件编译和普通 if 的区别是什么？",
        options: ["条件编译在编译前决定代码是否存在", "条件编译只能用于 float", "普通 if 不会生成代码", "没有区别"],
        answer: 0
      },
      {
        q: "把 i++ 传给可能多次使用参数的宏，风险是什么？",
        options: ["i 可能被修改多次", "i 一定不变", "宏会自动变函数", "编译器会删除 i"],
        answer: 0
      },
      {
        q: "STD_ON / STD_OFF 常用于什么？",
        options: ["配置开关", "数组下标", "堆内存大小", "函数返回地址"],
        answer: 0
      }
    ]
  },
  {
    id: "week4-error-handling",
    kicker: "第 19 节 · 错误处理",
    title: "错误处理：先失败得清楚，再成功得稳定",
    summary: "参数检查、错误码、早返回、DET 思路、防御式编程",
    body: `
      <h3>嵌入式代码为什么重视错误处理</h3>
      <p>嵌入式软件常常运行在长时间不断电的环境里，一次越界写、一次空指针解引用、一次错误长度处理，都可能变成很难复现的问题。好的错误处理不是为了“让代码看起来复杂”，而是为了让失败路径清楚、可控、可定位。</p>

      <h3>先检查参数，再做业务</h3>
      <pre><code>Std_ReturnType ReadByte(const uint8_t *data, uint16_t len, uint16_t index, uint8_t *value)
{
    Std_ReturnType ret = E_NOT_OK;

    if ((data != NULL_PTR) && (value != NULL_PTR) && (index < len)) {
        *value = data[index];
        ret = E_OK;
    }

    return ret;
}</code></pre>
      <p>这段代码的结构很稳定：默认失败，所有条件满足才成功。它避免了多个地方返回，也让失败路径更容易读。</p>

      <h3>早返回还是单出口</h3>
      <p>有些项目喜欢早返回，遇到错误立刻 <code>return</code>；有些项目为了 MISRA 或可读性，倾向单出口。你要适应项目规范。关键不是哪一种绝对正确，而是同一个模块里风格一致，错误路径清晰。</p>

      <h3>DET 思路</h3>
      <p>AUTOSAR 里常见开发错误检测 DET。比如模块未初始化、参数为空、ID 越界，都可以在开发阶段上报。简化理解：DET 不是业务错误处理，而是帮助开发者尽早发现接口使用错误。</p>

      <pre><code>#if (DID_DEV_ERROR_DETECT == STD_ON)
if (data == NULL_PTR) {
    (void)Det_ReportError(DID_MODULE_ID, 0U, DID_READ_API_ID, DID_E_PARAM_POINTER);
}
#endif</code></pre>

      <div class="note">
        <strong>防御式编程顺序：</strong>
        先检查模块状态，再检查指针，再检查长度和范围，最后才访问内存或硬件寄存器。
      </div>

      <h3>本节练习</h3>
      <div class="practice">
        <ol>
          <li>实现 <code>Did_ReadByte</code>，读取 buffer 指定位置的一个字节。</li>
          <li>检查 <code>data</code>、<code>value</code>、<code>index < len</code>。</li>
          <li>使用默认失败、成功赋值的结构。</li>
          <li>用注释写出每个失败条件对应的含义。</li>
        </ol>
      </div>
    `,
    quiz: [
      {
        q: "默认 ret = E_NOT_OK 的好处是什么？",
        options: ["只有所有条件满足时才改成成功", "让函数更慢", "避免写 if", "让指针自动有效"],
        answer: 0
      },
      {
        q: "访问 data[index] 前至少要检查什么？",
        options: ["data 非空且 index < len", "index 是偶数", "data 是 static", "len 等于 0"],
        answer: 0
      },
      {
        q: "DET 更偏向发现哪类问题？",
        options: ["开发阶段接口使用错误", "客户付款状态", "网页布局", "编译器版本名"],
        answer: 0
      },
      {
        q: "防御式编程通常先做什么？",
        options: ["检查状态、指针、长度和范围", "直接访问内存", "先写输出值", "先打印成功"],
        answer: 0
      },
      {
        q: "早返回和单出口应该如何选择？",
        options: ["遵守项目规范并保持一致", "永远混用", "只看函数名长度", "由数组大小决定"],
        answer: 0
      }
    ]
  },
  {
    id: "week4-review",
    kicker: "第 20 节 · DID 服务综合",
    title: "阶段综合：写一个简化 DID 服务模块",
    summary: "综合函数接口、头文件、宏、错误处理和模块拆分",
    body: `
      <h3>本阶段综合目标</h3>
      <p>第 16-20 节的目标是把“会写函数”推进到“会写一个小模块”。你要能把公开接口放进头文件，把内部实现藏在源文件里，用宏控制配置，用返回值表达错误，用指针安全地传递数据。</p>

      <h3>项目结构</h3>
      <pre><code>section16_20_project/
  Std_Types.h
  DidService_Cfg.h
  DidService.h
  DidService.c
  main.c</code></pre>

      <h3>功能要求</h3>
      <ul>
        <li><code>DidService.h</code> 暴露 <code>DidService_Init</code> 和 <code>DidService_Read</code>。</li>
        <li><code>DidService.c</code> 内部维护初始化状态。</li>
        <li>用配置表保存 DID、长度和数据。</li>
        <li>读取 DID 时检查模块是否初始化、输出指针是否为空、输出 buffer 是否足够。</li>
        <li>成功返回 <code>E_OK</code>，失败返回 <code>E_NOT_OK</code>。</li>
      </ul>

      <h3>推荐接口</h3>
      <pre><code>Std_ReturnType DidService_Init(void);

Std_ReturnType DidService_Read(
    uint16_t did,
    uint8_t *data,
    uint16_t dataSize,
    uint16_t *actualLen
);</code></pre>

      <h3>配置表思路</h3>
      <pre><code>typedef struct {
    uint16_t did;
    uint16_t length;
    const uint8_t *data;
} DidEntryType;</code></pre>

      <p>这里 <code>data</code> 是 <code>const uint8_t *</code>，表示配置表里的原始数据不应该被读取函数修改。读取时只是把它复制到调用者提供的输出 buffer。</p>

      <div class="warning">
        <strong>验收重点：</strong>
        不是代码越短越好，而是每条边界都清楚：模块是否初始化、DID 是否存在、指针是否为空、长度是否足够、输出长度是否正确。
      </div>

      <h3>复盘问题</h3>
      <ol>
        <li>为什么公开函数声明放在 <code>.h</code>，内部查表函数放在 <code>.c</code>？</li>
        <li><code>const uint8_t *data</code> 保护的是谁的数据？</li>
        <li>如果调用者给的 <code>dataSize</code> 不够，函数应该怎么返回？</li>
        <li>初始化状态为什么适合放在 <code>static</code> 变量里？</li>
      </ol>
    `,
    quiz: [
      {
        q: "DidService_Read 的公开声明应该放在哪里？",
        options: ["DidService.h", "main.c 的注释里", "编译器日志里", "链接脚本里"],
        answer: 0
      },
      {
        q: "内部查表函数如果不希望外部调用，应该怎么处理？",
        options: ["放在 .c 并加 static", "放在 .h 并去掉名字", "写成 float", "不用函数"],
        answer: 0
      },
      {
        q: "读取 DID 前检查初始化状态的目的是什么？",
        options: ["防止模块未准备好就被使用", "改变 DID 值", "扩大 buffer", "跳过编译"],
        answer: 0
      },
      {
        q: "dataSize 小于 DID 数据长度时应该怎么做？",
        options: ["返回 E_NOT_OK，避免越界写", "继续写满", "忽略长度", "把指针置空后写"],
        answer: 0
      },
      {
        q: "第 16-20 节综合练习真正训练的是什么？",
        options: ["模块边界和接口安全", "网页动画", "动态内存分配", "浮点优化"],
        answer: 0
      }
    ]
  }
];

const ADMIN_KEY = "adm-2c9kX7vLqN8wR5tY3mP4";
const currentStudentKey = "autosar-c-current-student";
const recordsKey = "autosar-c-learning-records";

const practiceLabs = {
  "day1-types": {
    prompt: "写一段 C 代码：打印 uint8_t、uint16_t、uint32_t 和 int 的 sizeof，并定义一个 CAN 报文结构体。",
    starter: "#include <stdio.h>\n#include <stdint.h>\n\nint main(void)\n{\n    /* 在这里写代码 */\n    return 0;\n}",
    checks: ["sizeof", "uint8_t", "uint16_t", "uint32_t", "struct"],
    reference: "#include <stdio.h>\n#include <stdint.h>\n\ntypedef struct {\n    uint32_t id;\n    uint8_t dlc;\n    uint8_t data[8];\n} CanFrameType;\n\nint main(void)\n{\n    printf(\"sizeof(uint8_t) = %zu\\n\", sizeof(uint8_t));\n    printf(\"sizeof(uint16_t) = %zu\\n\", sizeof(uint16_t));\n    printf(\"sizeof(uint32_t) = %zu\\n\", sizeof(uint32_t));\n    printf(\"sizeof(int) = %zu\\n\", sizeof(int));\n    printf(\"sizeof(CanFrameType) = %zu\\n\", sizeof(CanFrameType));\n    return 0;\n}"
  },
  "day2-storage": {
    prompt: "写一个 Counter 模块思路：内部用 static 保存计数，提供 Counter_Inc 和 Counter_Get。",
    starter: "#include <stdint.h>\n\n/* 在这里定义内部计数器和函数 */",
    checks: ["static", "Counter_Inc", "Counter_Get", "uint32_t"],
    reference: "#include <stdint.h>\n\nstatic uint32_t counter = 0U;\n\nvoid Counter_Inc(void)\n{\n    counter++;\n}\n\nuint32_t Counter_Get(void)\n{\n    return counter;\n}"
  },
  "day3-qualifiers": {
    prompt: "写一个 volatile flag 示例：一个函数设置 flag，另一个函数轮询 flag。",
    starter: "#include <stdint.h>\n\n/* volatile flag 示例 */",
    checks: ["volatile", "while", "flag", "uint8_t"],
    reference: "#include <stdint.h>\n\nstatic volatile uint8_t flag = 0U;\n\nvoid Isr_SetFlag(void)\n{\n    flag = 1U;\n}\n\nvoid MainLoop(void)\n{\n    while (flag == 0U) {\n        /* wait */\n    }\n}"
  },
  "day4-conversion": {
    prompt: "写一个安全的 CopyData 函数：检查空指针和长度，避免越界。",
    starter: "#include <stdint.h>\n\n#define E_OK 0U\n#define E_NOT_OK 1U\n#define NULL_PTR ((void *)0)\n\ntypedef uint8_t Std_ReturnType;\n\n/* 写 CopyData */",
    checks: ["Std_ReturnType", "NULL_PTR", "len", "dstSize", "for"],
    reference: "Std_ReturnType CopyData(uint8_t *dst, uint16_t dstSize, const uint8_t *src, uint16_t len)\n{\n    Std_ReturnType ret = E_NOT_OK;\n\n    if ((dst != NULL_PTR) && (src != NULL_PTR) && (len <= dstSize)) {\n        for (uint16_t i = 0U; i < len; i++) {\n            dst[i] = src[i];\n        }\n        ret = E_OK;\n    }\n\n    return ret;\n}"
  },
  "day5-review": {
    prompt: "实现 Buffer_CountValue：统计 buffer 中某个字节出现次数，要求检查空指针。",
    starter: "#include <stdint.h>\n#define NULL_PTR ((void *)0)\n\nuint16_t Buffer_CountValue(const uint8_t *buf, uint16_t len, uint8_t value)\n{\n    /* 在这里写代码 */\n}",
    checks: ["const uint8_t", "NULL_PTR", "for", "count", "return"],
    reference: "uint16_t Buffer_CountValue(const uint8_t *buf, uint16_t len, uint8_t value)\n{\n    uint16_t count = 0U;\n\n    if (buf != NULL_PTR) {\n        for (uint16_t i = 0U; i < len; i++) {\n            if (buf[i] == value) {\n                count++;\n            }\n        }\n    }\n\n    return count;\n}"
  },
  "week2-address": {
    prompt: "写代码打印 a、&a、p、&p，并解释指针 p 保存了什么。",
    starter: "#include <stdio.h>\n\nint main(void)\n{\n    int a = 10;\n    /* 定义指针并打印 */\n    return 0;\n}",
    checks: ["int *", "&a", "&p", "%p", "(void *)"],
    reference: "int main(void)\n{\n    int a = 10;\n    int *p = &a;\n\n    printf(\"a = %d\\n\", a);\n    printf(\"&a = %p\\n\", (void *)&a);\n    printf(\"p = %p\\n\", (void *)p);\n    printf(\"&p = %p\\n\", (void *)&p);\n    return 0;\n}"
  },
  "week2-deref": {
    prompt: "写 SetValue 和 Swap，要求所有指针使用前检查 NULL_PTR。",
    starter: "#include <stdint.h>\n#define NULL_PTR ((void *)0)\n\n/* 写 SetValue 和 Swap */",
    checks: ["SetValue", "Swap", "NULL_PTR", "*", "uint8_t"],
    reference: "void SetValue(uint16_t *value, uint16_t newValue)\n{\n    if (value != NULL_PTR) {\n        *value = newValue;\n    }\n}\n\nvoid Swap(uint8_t *a, uint8_t *b)\n{\n    if ((a != NULL_PTR) && (b != NULL_PTR)) {\n        uint8_t temp = *a;\n        *a = *b;\n        *b = temp;\n    }\n}"
  },
  "week2-array": {
    prompt: "写 FindByte：在 const buffer 中查找目标字节，找到返回下标，找不到返回 -1。",
    starter: "#include <stdint.h>\n#define NULL_PTR ((void *)0)\n\nint16_t FindByte(const uint8_t *data, uint16_t len, uint8_t target)\n{\n    /* 在这里写代码 */\n}",
    checks: ["const uint8_t", "NULL_PTR", "for", "target", "return"],
    reference: "int16_t FindByte(const uint8_t *data, uint16_t len, uint8_t target)\n{\n    int16_t result = -1;\n\n    if (data != NULL_PTR) {\n        for (uint16_t i = 0U; i < len; i++) {\n            if (data[i] == target) {\n                result = (int16_t)i;\n                break;\n            }\n        }\n    }\n\n    return result;\n}"
  },
  "week2-params": {
    prompt: "写 ReadU16BigEndian：从 data[offset] 和 data[offset+1] 读取 uint16_t，检查空指针和长度。",
    starter: "#include <stdint.h>\n#define E_OK 0U\n#define E_NOT_OK 1U\n#define NULL_PTR ((void *)0)\ntypedef uint8_t Std_ReturnType;\n\n/* 写 ReadU16BigEndian */",
    checks: ["Std_ReturnType", "const uint8_t", "offset", "value", "NULL_PTR"],
    reference: "Std_ReturnType ReadU16BigEndian(const uint8_t *data, uint16_t len, uint16_t offset, uint16_t *value)\n{\n    Std_ReturnType ret = E_NOT_OK;\n\n    if ((data != NULL_PTR) && (value != NULL_PTR) && (offset < len) && ((uint16_t)(offset + 1U) < len)) {\n        *value = (uint16_t)(((uint16_t)data[offset] << 8U) | data[offset + 1U]);\n        ret = E_OK;\n    }\n\n    return ret;\n}"
  },
  "week2-danger": {
    prompt: "写 PduBuffer_Copy：检查 dst、src、copiedLen 和长度，成功后复制并返回 E_OK。",
    starter: "#include <stdint.h>\n#define E_OK 0U\n#define E_NOT_OK 1U\n#define NULL_PTR ((void *)0)\ntypedef uint8_t Std_ReturnType;\n\n/* 写 PduBuffer_Copy */",
    checks: ["PduBuffer_Copy", "copiedLen", "dstSize", "srcLen", "NULL_PTR"],
    reference: "Std_ReturnType PduBuffer_Copy(uint8_t *dst, uint16_t dstSize, const uint8_t *src, uint16_t srcLen, uint16_t *copiedLen)\n{\n    Std_ReturnType ret = E_NOT_OK;\n\n    if ((dst != NULL_PTR) && (src != NULL_PTR) && (copiedLen != NULL_PTR) && (srcLen <= dstSize)) {\n        for (uint16_t i = 0U; i < srcLen; i++) {\n            dst[i] = src[i];\n        }\n        *copiedLen = srcLen;\n        ret = E_OK;\n    }\n\n    return ret;\n}"
  },
  "week3-struct": {
    prompt: "定义 DidConfigType 结构体，含 did/length/data[8]，用指定初始化创建两个配置项。",
    starter: `#include <stdint.h>

/* 定义 DidConfigType */`,
    checks: ["typedef struct", "uint16_t", "uint8_t", "data[8]", "DidConfigType"],
    reference: `#include <stdint.h>

typedef struct {
    uint16_t did;
    uint8_t length;
    uint8_t data[8];
} DidConfigType;

int main(void)
{
    DidConfigType cfg1 = { .did = 0xF190U, .length = 4U, .data = { 0x01U, 0x02U, 0x03U, 0x04U } };
    DidConfigType cfg2 = { .did = 0xF187U, .length = 2U, .data = { 0xAAU, 0xBBU } };
    return 0;
}`
  },
  "week3-union": {
    prompt: "定义 RegAccessType 联合体，通过 bytes 数组取出 uint32_t 的指定字节。",
    starter: `#include <stdint.h>

/* 定义 RegAccessType 和 GetU32Byte */`,
    checks: ["typedef union", "uint32_t", "uint8_t", "bytes[4]", "GetU32Byte"],
    reference: `#include <stdint.h>

typedef union {
    uint32_t word;
    uint8_t bytes[4];
} RegAccessType;

uint8_t GetU32Byte(uint32_t value, uint8_t index)
{
    RegAccessType u;
    u.word = value;
    return (index < 4U) ? u.bytes[index] : 0U;
}`
  },
  "week3-bitfield": {
    prompt: "定义一个 16 位寄存器位域（enable:1, mode:3, status:4, reserved:8），设置值并打印。",
    starter: `#include <stdint.h>
#include <stdio.h>

/* 定义位域结构体 */`,
    checks: ["uint16_t", ": 1", ": 3", ": 4", ": 8", "enable", "mode"],
    reference: `#include <stdint.h>
#include <stdio.h>

typedef struct {
    uint16_t enable   : 1;
    uint16_t mode     : 3;
    uint16_t status   : 4;
    uint16_t reserved : 8;
} RegBitsType;

int main(void)
{
    RegBitsType reg = { .enable = 1U, .mode = 2U, .status = 0x0FU };
    printf("sizeof = %zu\n", sizeof(RegBitsType));
    printf("value = 0x%04X\n", *(uint16_t *)&reg);
    return 0;
}`
  },
  "week3-alignment": {
    prompt: "定义含 uint8_t + uint32_t + uint8_t 的结构体，打印 sizeof，再调整顺序观察变化。",
    starter: `#include <stdint.h>
#include <stdio.h>

/* 定义结构体并打印 sizeof */`,
    checks: ["typedef struct", "uint8_t", "uint32_t", "sizeof", "printf"],
    reference: `#include <stdint.h>
#include <stdio.h>

typedef struct {
    uint8_t a;
    uint32_t b;
    uint8_t c;
} SampleType;

typedef struct {
    uint32_t b;
    uint8_t a;
    uint8_t c;
} OptimizedType;

int main(void)
{
    printf("SampleType = %zu\n", sizeof(SampleType));
    printf("OptimizedType = %zu\n", sizeof(OptimizedType));
    return 0;
}`
  },
  "week3-review": {
    prompt: "实现 RegControl_SetMode 和 RegControl_GetPrescale，使用位域联合体。",
    starter: `#include <stdint.h>

/* 定义 RegControlType 和函数 */`,
    checks: ["typedef union", "uint32_t", ":", "RegControl_SetMode", "RegControl_GetPrescale"],
    reference: `#include <stdint.h>

typedef union {
    uint32_t raw;
    struct {
        uint32_t enable   : 1;
        uint32_t mode     : 3;
        uint32_t prescale : 8;
        uint32_t reserved : 20;
    } bits;
} RegControlType;

void RegControl_SetMode(uint32_t *reg, uint8_t mode)
{
    if (reg != NULL) {
        RegControlType *p = (RegControlType *)reg;
        p->bits.mode = (uint32_t)(mode & 0x07U);
    }
}

uint8_t RegControl_GetPrescale(uint32_t reg)
{
    RegControlType u;
    u.raw = reg;
    return (uint8_t)u.bits.prescale;
}`
  },
  "week4-function-interface": {
    prompt: "实现 Did_CopyValue：输入 src 只读，输出 dst 可写，检查空指针和长度，返回 Std_ReturnType。",
    starter: `#include <stdint.h>

#define E_OK 0U
#define E_NOT_OK 1U
#define NULL_PTR ((void *)0)
typedef uint8_t Std_ReturnType;

/* 写 Did_CopyValue */`,
    checks: ["Did_CopyValue", "const uint8_t", "actualLen", "dstSize", "E_OK", "NULL_PTR"],
    reference: `Std_ReturnType Did_CopyValue(uint8_t *dst, uint16_t dstSize, const uint8_t *src, uint16_t srcLen, uint16_t *actualLen)
{
    Std_ReturnType ret = E_NOT_OK;

    if ((dst != NULL_PTR) && (src != NULL_PTR) && (actualLen != NULL_PTR) && (srcLen <= dstSize)) {
        for (uint16_t i = 0U; i < srcLen; i++) {
            dst[i] = src[i];
        }
        *actualLen = srcLen;
        ret = E_OK;
    }

    return ret;
}`
  },
  "week4-header-source": {
    prompt: "写出 DidService.h 和 DidService.c 的骨架：头文件放公开声明，源文件放 static 内部函数。",
    starter: `/* DidService.h */
#ifndef DID_SERVICE_H
#define DID_SERVICE_H

/* 在这里写公开接口 */

#endif

/* DidService.c */
/* 在这里写 static 内部函数和公开函数实现 */`,
    checks: ["#ifndef", "#define", "#endif", "static", "DidService_Read"],
    reference: `/* DidService.h */
#ifndef DID_SERVICE_H
#define DID_SERVICE_H

#include <stdint.h>

typedef uint8_t Std_ReturnType;
Std_ReturnType DidService_Init(void);
Std_ReturnType DidService_Read(uint16_t did, uint8_t *data, uint16_t dataSize, uint16_t *actualLen);

#endif /* DID_SERVICE_H */

/* DidService.c */
static const uint8_t *DidService_FindData(uint16_t did, uint16_t *len)
{
    (void)did;
    (void)len;
    return (const uint8_t *)0;
}

Std_ReturnType DidService_Init(void)
{
    return 0U;
}`
  },
  "week4-macro-preprocess": {
    prompt: "写 CLAMP_U16 宏和 DID_DEV_ERROR_DETECT 条件编译示例，注意宏参数括号。",
    starter: `#include <stdint.h>

#define STD_ON 1U
#define STD_OFF 0U
#define DID_DEV_ERROR_DETECT STD_ON

/* 写 CLAMP_U16 和条件编译 */`,
    checks: ["#define", "CLAMP_U16", "((value)", "#if", "DID_DEV_ERROR_DETECT"],
    reference: `#include <stdint.h>

#define STD_ON 1U
#define STD_OFF 0U
#define DID_DEV_ERROR_DETECT STD_ON
#define CLAMP_U16(value, min, max) (((value) < (min)) ? (min) : (((value) > (max)) ? (max) : (value)))

void Did_ReportPointerError(void)
{
#if (DID_DEV_ERROR_DETECT == STD_ON)
    /* Det_ReportError(...) */
#endif
}`
  },
  "week4-error-handling": {
    prompt: "实现 Did_ReadByte：默认失败，检查指针和边界，成功时写输出参数。",
    starter: `#include <stdint.h>

#define E_OK 0U
#define E_NOT_OK 1U
#define NULL_PTR ((void *)0)
typedef uint8_t Std_ReturnType;

/* 写 Did_ReadByte */`,
    checks: ["Did_ReadByte", "E_NOT_OK", "data != NULL_PTR", "value != NULL_PTR", "index < len", "E_OK"],
    reference: `Std_ReturnType Did_ReadByte(const uint8_t *data, uint16_t len, uint16_t index, uint8_t *value)
{
    Std_ReturnType ret = E_NOT_OK;

    if ((data != NULL_PTR) && (value != NULL_PTR) && (index < len)) {
        *value = data[index];
        ret = E_OK;
    }

    return ret;
}`
  },
  "week4-review": {
    prompt: "写简化 DidService_Read：检查初始化、指针、长度，并从配置表复制数据。",
    starter: `#include <stdint.h>

#define E_OK 0U
#define E_NOT_OK 1U
#define NULL_PTR ((void *)0)
typedef uint8_t Std_ReturnType;

/* 写 DidEntryType、初始化状态和 DidService_Read */`,
    checks: ["DidEntryType", "static", "DidService_Read", "actualLen", "dataSize", "E_NOT_OK"],
    reference: `typedef struct {
    uint16_t did;
    uint16_t length;
    const uint8_t *data;
} DidEntryType;

static uint8_t didServiceInitialized = 0U;

Std_ReturnType DidService_Read(uint16_t did, uint8_t *data, uint16_t dataSize, uint16_t *actualLen)
{
    Std_ReturnType ret = E_NOT_OK;

    if ((didServiceInitialized != 0U) && (data != NULL_PTR) && (actualLen != NULL_PTR)) {
        const DidEntryType *entry = DidService_Find(did);
        if ((entry != NULL_PTR) && (entry->length <= dataSize)) {
            for (uint16_t i = 0U; i < entry->length; i++) {
                data[i] = entry->data[i];
            }
            *actualLen = entry->length;
            ret = E_OK;
        }
    }

    return ret;
}`
  }
};

let currentStudent = "";
let savedState = {};
let savedQuiz = {};
let savedLabs = {};

const navList = document.querySelector("#navList");
const moduleContainer = document.querySelector("#moduleContainer");
const template = document.querySelector("#moduleTemplate");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const loginOverlay = document.querySelector("#loginOverlay");
const loginForm = document.querySelector("#loginForm");
const studentNameInput = document.querySelector("#studentNameInput");
const studentBadge = document.querySelector("#studentBadge");
const switchStudentBtn = document.querySelector("#switchStudentBtn");
const adminBtn = document.querySelector("#adminBtn");
const adminPanel = document.querySelector("#adminPanel");
const closeAdminBtn = document.querySelector("#closeAdminBtn");
const adminLoginForm = document.querySelector("#adminLoginForm");
const adminKeyInput = document.querySelector("#adminKeyInput");
const adminRecords = document.querySelector("#adminRecords");
const wrongBookBtn = document.querySelector("#wrongBookBtn");
const wrongBookPanel = document.querySelector("#wrongBookPanel");
const closeWrongBookBtn = document.querySelector("#closeWrongBookBtn");
const wrongBookContent = document.querySelector("#wrongBookContent");

function readRecords() {
  return JSON.parse(localStorage.getItem(recordsKey) || "{}");
}

function writeRecords(records) {
  localStorage.setItem(recordsKey, JSON.stringify(records));
}

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ");
}

function loadStudent(name) {
  const records = readRecords();
  currentStudent = normalizeName(name);
  const record = records[currentStudent] || {
    state: {},
    quiz: {},
    labs: {},
    lastSeen: new Date().toISOString()
  };
  savedState = record.state || {};
  savedQuiz = record.quiz || {};
  savedLabs = record.labs || {};
  record.lastSeen = new Date().toISOString();
  records[currentStudent] = record;
  writeRecords(records);
  localStorage.setItem(currentStudentKey, currentStudent);
  studentBadge.textContent = currentStudent;
  loginOverlay.classList.add("is-hidden");
}

function saveStudentRecord() {
  if (!currentStudent) {
    return;
  }
  const records = readRecords();
  records[currentStudent] = {
    state: savedState,
    quiz: savedQuiz,
    labs: savedLabs,
    lastSeen: new Date().toISOString()
  };
  writeRecords(records);
}

function saveState() {
  saveStudentRecord();
}

function saveQuiz() {
  saveStudentRecord();
}

function saveLabs() {
  saveStudentRecord();
}

function updateProgress() {
  const total = modules.length;
  const done = modules.filter((module) => savedState[module.id]).length;
  progressText.textContent = `${done} / ${total} 已完成`;
  progressBar.style.width = `${total === 0 ? 0 : (done / total) * 100}%`;

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("is-done", Boolean(savedState[item.dataset.id]));
    const dot = item.querySelector(".nav-dot");
    dot.textContent = savedState[item.dataset.id] ? "✓" : "";
  });
}

function getStageInfo(module) {
  const section = Number(module.kicker.match(/第\s*(\d+)\s*节/)?.[1] || 1);
  if (section >= 16) {
    return { key: "stage4", label: "第 16-20 节 · 函数接口与模块化" };
  }
  if (section >= 11) {
    return { key: "stage3", label: "第 11-15 节 · 结构体与内存布局" };
  }
  if (section >= 6) {
    return { key: "stage2", label: "第 06-10 节 · 指针专项" };
  }
  return { key: "stage1", label: "第 01-05 节 · C 底层基础" };
}

function renderNav() {
  let currentGroup = "";
  modules.forEach((module) => {
    const stageInfo = getStageInfo(module);
    const group = stageInfo.label;
    if (group !== currentGroup) {
      currentGroup = group;
      const groupEl = document.createElement("div");
      groupEl.className = "nav-group";
      groupEl.textContent = group;
      navList.appendChild(groupEl);
    }

    const item = document.createElement("a");
    item.className = "nav-item";
    item.href = `#${module.id}`;
    item.dataset.id = module.id;
    item.innerHTML = `
      <span class="nav-dot" aria-hidden="true"></span>
      <span>
        <strong>${module.title}</strong>
        <span>${module.summary}</span>
      </span>
    `;
    navList.appendChild(item);
  });
}

function renderQuiz(module, quizItems, resultEl) {
  module.quiz.forEach((question, index) => {
    const questionEl = document.createElement("div");
    questionEl.className = "question";
    questionEl.innerHTML = `<p>${index + 1}. ${question.q}</p>`;

    const answersEl = document.createElement("div");
    answersEl.className = "answers";

    question.options.forEach((option, optionIndex) => {
      const id = `${module.id}-${index}-${optionIndex}`;
      const label = document.createElement("label");
      label.setAttribute("for", id);
      label.innerHTML = `
        <input id="${id}" type="radio" name="${module.id}-${index}" value="${optionIndex}">
        <span>${option}</span>
      `;
      answersEl.appendChild(label);
    });

    questionEl.appendChild(answersEl);
    quizItems.appendChild(questionEl);
  });

  if (savedQuiz[module.id]) {
    const saved = savedQuiz[module.id];
    resultEl.textContent = typeof saved === "string"
      ? saved
      : `上次得分：${saved.score} / ${saved.total}。重新提交可刷新解析。`;
  }
}

function renderPractice(module, labEl) {
  const lab = practiceLabs[module.id];
  if (!lab) {
    labEl.remove();
    return;
  }
  const last = savedLabs[module.id]?.code || lab.starter;
  labEl.innerHTML = `
    <div class="lab-head">
      <div>
        <p class="module-kicker">代码练习</p>
        <h3>终端练习区</h3>
        <p>${lab.prompt}</p>
      </div>
    </div>
    <div class="code-terminal">
      <textarea spellcheck="false">${last}</textarea>
      <div class="lab-actions">
        <button class="lab-btn submit-lab" type="button">提交练习</button>
        <button class="lab-btn secondary preview-highlight" type="button">预览高亮</button>
        <button class="lab-btn secondary show-reference" type="button">查看参考答案</button>
      </div>
      <div class="lab-preview" aria-live="polite" style="display:none;">
        <pre><code class="language-c"></code></pre>
      </div>
      <div class="lab-result ${savedLabs[module.id]?.feedbackClass || ""}" aria-live="polite">${savedLabs[module.id]?.feedback || "这里不会真正编译 C 代码，会检查关键结构是否齐全，并保存你的提交。"}</div>
      <pre class="reference-answer"><code>${escapeHtml(lab.reference)}</code></pre>
    </div>
  `;

  const textarea = labEl.querySelector("textarea");
  const result = labEl.querySelector(".lab-result");
  const reference = labEl.querySelector(".reference-answer");
  labEl.querySelector(".submit-lab").addEventListener("click", () => {
    const code = textarea.value;
    const missing = lab.checks.filter((token) => !code.includes(token));
    let feedbackClass = "";
    let feedback = "";
    if (missing.length === 0) {
      feedbackClass = "is-success";
      feedback = "提交完成：关键结构都出现了。下一步建议你逐行解释每个变量、指针和边界检查。";
    } else if (missing.length <= 2) {
      feedbackClass = "is-partial";
      feedback = `提交完成：还建议补充这些关键点：${missing.join("、")}。`;
    } else {
      feedbackClass = "is-fail";
      feedback = `提交完成：建议补充这些关键点：${missing.join("、")}。`;
    }
    result.textContent = feedback;
    result.className = `lab-result ${feedbackClass}`;
    savedLabs[module.id] = {
      code,
      feedback,
      feedbackClass,
      submittedAt: new Date().toISOString()
    };
    saveLabs();
  });
  labEl.querySelector(".preview-highlight").addEventListener("click", () => {
    const preview = labEl.querySelector(".lab-preview");
    const codeBlock = preview.querySelector("code");
    codeBlock.textContent = textarea.value;
    preview.style.display = preview.style.display === "none" ? "block" : "none";
    if (typeof Prism !== "undefined" && preview.style.display !== "none") {
      codeBlock.classList.add("language-c");
      Prism.highlightElement(codeBlock);
    }
  });

  labEl.querySelector(".show-reference").addEventListener("click", () => {
    reference.classList.toggle("is-visible");
  });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function explainQuestion(question, correctOption) {
  const q = question.q;
  if (q.includes("uint8_t") && q.includes("范围")) {
    return "uint8_t 是无符号 8 位整数，8 个 bit 一共能表示 256 个值，所以范围是 0 到 255。";
  }
  if (q.includes("sizeof")) {
    return "sizeof 返回对象或类型占用的字节数。数组名和指针变量在 sizeof 下尤其要区分：数组得到整体大小，指针得到指针变量大小。";
  }
  if (q.includes("static")) {
    return "static 用在文件作用域函数或变量上，会限制符号只在当前源文件可见；用在局部变量上，会延长变量生命周期。";
  }
  if (q.includes("extern")) {
    return "extern 是声明，表示定义在别处；真正的全局变量定义应该只放在一个 .c 文件里，避免重复定义。";
  }
  if (q.includes("volatile")) {
    return "volatile 告诉编译器每次都要真实访问内存，适合寄存器、中断 flag、DMA 更新区域；它不是锁，也不保证原子性。";
  }
  if (q.includes("const")) {
    return "const 表达不应通过这个接口修改数据。输入 buffer 常写成 const uint8_t *，这样能保护调用者数据。";
  }
  if (q.includes("指针") || q.includes("&a") || q.includes("*p") || q.includes("NULL_PTR")) {
    return "指针保存地址，& 用来取地址，* 用来解引用。解引用前必须保证指针指向有效对象，空指针和未初始化指针都不能解引用。";
  }
  if (q.includes("数组") || q.includes("buffer") || q.includes("越界") || q.includes("len")) {
    return "buffer 函数必须同时传长度，因为指针本身不知道后面有多少元素。访问数组前要检查边界，避免越界读写。";
  }
  if (q.includes("Std_ReturnType") || q.includes("输出")) {
    return "AUTOSAR 风格接口常用返回值表示成功失败，真正的数据通过输出指针带出；输出指针必须检查空指针和容量。";
  }
  if (q.includes("头文件") || q.includes(".h") || q.includes("include guard")) {
    return "头文件负责暴露模块接口，include guard 防止重复包含。函数实现和私有数据应尽量放在 .c 文件里，避免接口污染和重复定义。";
  }
  if (q.includes("static") || q.includes("内部")) {
    return "static 修饰文件作用域函数或变量时，会把可见范围限制在当前 .c 文件内，适合隐藏模块内部实现细节。";
  }
  if (q.includes("宏") || q.includes("预处理") || q.includes("条件编译") || q.includes("STD_ON")) {
    return "预处理发生在编译前，宏是文本替换，条件编译决定代码是否进入编译器。函数式宏要给参数加括号，并避免传入 i++ 这类有副作用的表达式。";
  }
  if (q.includes("DET") || q.includes("错误") || q.includes("E_NOT_OK") || q.includes("初始化")) {
    return "嵌入式错误处理要先检查状态、指针、长度和范围。默认失败、条件满足才成功，是一种稳妥的接口写法；DET 常用于开发阶段暴露错误用法。";
  }
  return `正确答案是“${correctOption}”。这道题考的是本节的核心概念：先判断数据在哪里、谁能修改它、边界是否安全。`;
}

function renderModules() {
  moduleContainer.innerHTML = "";
  modules.forEach((module) => {
    const node = template.content.firstElementChild.cloneNode(true);
    const stageInfo = getStageInfo(module);
    node.id = module.id;
    node.dataset.stage = stageInfo.key;
    node.querySelector(".module-kicker").textContent = module.kicker;
    node.querySelector("h2").textContent = module.title;
    node.querySelector(".module-body").innerHTML = module.body;

    const checkbox = node.querySelector(".done-toggle input");
    checkbox.checked = Boolean(savedState[module.id]);
    checkbox.addEventListener("change", () => {
      savedState[module.id] = checkbox.checked;
      saveState();
      updateProgress();
    });

    renderPractice(module, node.querySelector(".practice-lab"));

    const quizItems = node.querySelector(".quiz-items");
    const resultEl = node.querySelector(".quiz-result");
    renderQuiz(module, quizItems, resultEl);

    node.querySelector(".ghost-btn").addEventListener("click", () => {
      let score = 0;
      const feedback = [];
      module.quiz.forEach((question, index) => {
        const selected = node.querySelector(`input[name="${module.id}-${index}"]:checked`);
        const selectedValue = selected ? Number(selected.value) : null;
        const isCorrect = selectedValue === question.answer;
        const correctOption = question.options[question.answer];
        if (selected && Number(selected.value) === question.answer) {
          score++;
        }
        feedback.push({
          index,
          selected: selectedValue,
          isCorrect,
          correctOption,
          explanation: explainQuestion(question, correctOption)
        });
      });
      const message = `得分：${score} / ${module.quiz.length}。${score === module.quiz.length ? "很好，这一节可以勾选完成。" : "建议回到上面的讲解，把错题对应的段落再过一遍。"}`;
      resultEl.innerHTML = `
        <div class="quiz-feedback">
          <strong>${message}</strong>
          ${feedback.map((item) => `
            <div class="feedback-item ${item.isCorrect ? "" : "is-wrong"}">
              <strong>第 ${item.index + 1} 题：${item.isCorrect ? "答对了" : "答错了"}</strong>
              <p>正确答案：${item.correctOption}</p>
              <p>${item.explanation}</p>
            </div>
          `).join("")}
        </div>
      `;
      savedQuiz[module.id] = {
        score,
        total: module.quiz.length,
        feedback,
        submittedAt: new Date().toISOString()
      };
      saveQuiz();
    });

    moduleContainer.appendChild(node);
  });
  
  /* 章节导航 */
  modules.forEach((module, index) => {
    const node = moduleContainer.querySelector(`#${module.id}`);
    if (!node) return;
    const nav = document.createElement("div");
    nav.className = "module-nav";
    const prev = index > 0 ? modules[index - 1] : null;
    const next = index < modules.length - 1 ? modules[index + 1] : null;
    nav.innerHTML = `
      ${prev ? `<a href="#${prev.id}" class="ghost-btn">← ${prev.title}</a>` : "<span></span>"}
      ${next ? `<a href="#${next.id}" class="ghost-btn">${next.title} →</a>` : "<span></span>"}
    `;
    node.appendChild(nav);
  });
  
  /* 语法高亮 */
  if (typeof Prism !== "undefined") {
    moduleContainer.querySelectorAll("pre code, .reference-answer code").forEach((block) => {
      block.classList.add("language-c");
    });
    Prism.highlightAll();
  }
}

function renderAdminRecords() {
  const records = readRecords();
  const names = Object.keys(records);
  if (names.length === 0) {
    adminRecords.innerHTML = "<p>暂无记录。</p>";
    return;
  }
  adminRecords.innerHTML = names.map((name) => {
    const record = records[name];
    const done = Object.values(record.state || {}).filter(Boolean).length;
    const quizzes = Object.values(record.quiz || {}).filter(Boolean).length;
    const labs = Object.values(record.labs || {}).filter(Boolean).length;
    return `
      <div class="record-card">
        <strong>${name}</strong>
        <span>已学 ${done} / ${modules.length}，已交小测 ${quizzes}，已交练习 ${labs}，最近访问 ${new Date(record.lastSeen).toLocaleString()}</span>
      </div>
    `;
  }).join("");
}

function renderWrongBook() {
  const wrongItems = [];
  Object.entries(savedQuiz).forEach(([moduleId, quizData]) => {
    if (quizData && quizData.feedback) {
      quizData.feedback.forEach((item) => {
        if (!item.isCorrect) {
          const module = modules.find((m) => m.id === moduleId);
          if (module) {
            wrongItems.push({
              moduleTitle: module.title,
              moduleId: moduleId,
              question: module.quiz[item.index],
              selectedOption: item.selected != null ? module.quiz[item.index].options[item.selected] : "未作答",
              correctOption: item.correctOption,
              explanation: item.explanation
            });
          }
        }
      });
    }
  });
  
  if (wrongItems.length === 0) {
    wrongBookContent.innerHTML = "<p>暂无错题，继续保持！</p>";
    return;
  }
  
  wrongBookContent.innerHTML = wrongItems.map((item, idx) => `
    <div class="record-card">
      <strong>来自：${item.moduleTitle}</strong>
      <p>${idx + 1}. ${item.question.q}</p>
      <p style="color: var(--accent-2);">你的答案：${item.selectedOption}</p>
      <p style="color: var(--accent);">正确答案：${item.correctOption}</p>
      <p style="color: var(--muted); font-size: 13px;">${item.explanation}</p>
      <a href="#${item.moduleId}" class="ghost-btn" style="margin-top: 8px; display: inline-block;" onclick="wrongBookPanel.classList.add('is-hidden');">跳回本节</a>
    </div>
  `).join("");
}

function startAppForStudent(name) {
  loadStudent(name);
  if (navList.children.length === 0) {
    renderNav();
  }
  renderModules();
  updateProgress();
  wrongBookBtn.style.display = "inline-block";
  loginOverlay.classList.add("is-hidden");
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = normalizeName(studentNameInput.value);
  if (name) {
    startAppForStudent(name);
  }
});

switchStudentBtn.addEventListener("click", () => {
  loginOverlay.classList.remove("is-hidden");
  studentNameInput.value = "";
  studentNameInput.focus();
});

adminBtn.addEventListener("click", () => {
  adminPanel.classList.remove("is-hidden");
  adminKeyInput.focus();
});

closeAdminBtn.addEventListener("click", () => {
  adminPanel.classList.add("is-hidden");
});

wrongBookBtn.addEventListener("click", () => {
  renderWrongBook();
  wrongBookPanel.classList.remove("is-hidden");
});

closeWrongBookBtn.addEventListener("click", () => {
  wrongBookPanel.classList.add("is-hidden");
});

adminLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (adminKeyInput.value === ADMIN_KEY) {
    renderAdminRecords();
  } else {
    adminRecords.innerHTML = "<p>密钥不正确。</p>";
  }
});

const rememberedStudent = localStorage.getItem(currentStudentKey);
if (rememberedStudent) {
  startAppForStudent(rememberedStudent);
} else {
  loginOverlay.classList.remove("is-hidden");
  studentNameInput.focus();
}

/* 夜间模式 */
const themeToggle = document.createElement("button");
themeToggle.className = "theme-toggle";
themeToggle.textContent = "🌙";
themeToggle.setAttribute("aria-label", "切换夜间模式");
themeToggle.type = "button";
themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.classList.toggle("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("autosar-theme", isDark ? "dark" : "light");
});

const savedTheme = localStorage.getItem("autosar-theme");
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
  themeToggle.textContent = "☀️";
}

document.querySelector(".user-tools").appendChild(themeToggle);

/* 返回顶部按钮 */
const backToTop = document.createElement("button");
backToTop.className = "back-to-top";
backToTop.textContent = "↑";
backToTop.setAttribute("aria-label", "返回顶部");
backToTop.type = "button";
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
document.body.appendChild(backToTop);

let scrollRaf = null;
window.addEventListener("scroll", () => {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    backToTop.classList.toggle("is-visible", window.scrollY > 600);
    scrollRaf = null;
  });
});

/* ESC 键关闭弹窗 */
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (currentStudent && !loginOverlay.classList.contains("is-hidden")) {
      loginOverlay.classList.add("is-hidden");
    }
    if (!adminPanel.classList.contains("is-hidden")) {
      adminPanel.classList.add("is-hidden");
    }
    if (!wrongBookPanel.classList.contains("is-hidden")) {
      wrongBookPanel.classList.add("is-hidden");
    }
  }
});
