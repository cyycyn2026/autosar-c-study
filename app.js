const modules = [
  {
    id: "day1-types",
    kicker: "Day 1 · 基本类型",
    title: "基本类型、宽度和嵌入式里的类型选择",
    summary: "char/int/float、stdint、sizeof、有符号和无符号",
    body: `
      <h3>为什么第一天要先学类型</h3>
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
      <p><code>sizeof</code> 是编译期运算符。它返回对象或类型占用的字节数。学习第 1 周时，你要养成一个习惯：看到变量就问自己，它占几个字节？它的范围是多少？它在表达式里会不会被提升？</p>
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

      <h3>今天的练习</h3>
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
    kicker: "Day 2 · 变量与存储期",
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

      <h3>今天的练习</h3>
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
    kicker: "Day 3 · 关键修饰符",
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

      <h3>今天的练习</h3>
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
    kicker: "Day 4 · 表达式与转换",
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

      <h3>今天的练习</h3>
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
    kicker: "Day 5-7 · 复盘与周测",
    title: "把第一周知识串起来：一个小型 Std_Types 练习",
    summary: "复盘、代码练习、周末考核",
    body: `
      <h3>本周你真正要带走的东西</h3>
      <p>第 1 周不要求你写出多复杂的程序，但要求你开始形成嵌入式 C 的底层直觉。以后看到任何一段代码，都先问：类型是什么？范围是什么？这个变量活多久？谁能访问它？它会不会被中断或硬件改掉？表达式里有没有隐藏转换？</p>

      <h3>周末综合练习：简化版 Std_Types + Buffer 模块</h3>
      <p>建立一个小工程，先不用复杂构建系统，几个文件就够。</p>
      <pre><code>week1_project/
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
        q: "第一周的核心不是背语法，而是建立什么？",
        options: ["UI 设计能力", "内存、类型、链接可见性的工程直觉", "数据库能力", "脚本语言能力"],
        answer: 1
      }
    ]
  },
  {
    id: "week2-address",
    kicker: "Week 2 · Day 1",
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

      <h3>今天的练习</h3>
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
    kicker: "Week 2 · Day 2",
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

      <h3>今天的练习</h3>
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
    kicker: "Week 2 · Day 3",
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

      <h3>今天的练习</h3>
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
    kicker: "Week 2 · Day 4",
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

      <h3>今天的练习</h3>
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
    kicker: "Week 2 · Day 5-7",
    title: "危险指针和周末综合练习",
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

      <h3>周末综合项目：Pdu Buffer 小模块</h3>
      <p>这个小项目贴近 AUTOSAR 通信栈里的 buffer 操作，目的是把指针、数组、长度和返回值串起来。</p>
      <pre><code>week2_pointer_project/
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
  }
];

const stateKey = "autosar-c-foundation-state";
const quizKey = "autosar-c-foundation-quiz";
const oldStateKey = "autosar-c-week1-state";
const oldQuizKey = "autosar-c-week1-quiz";

const savedState = {
  ...JSON.parse(localStorage.getItem(oldStateKey) || "{}"),
  ...JSON.parse(localStorage.getItem(stateKey) || "{}")
};
const savedQuiz = {
  ...JSON.parse(localStorage.getItem(oldQuizKey) || "{}"),
  ...JSON.parse(localStorage.getItem(quizKey) || "{}")
};

const navList = document.querySelector("#navList");
const moduleContainer = document.querySelector("#moduleContainer");
const template = document.querySelector("#moduleTemplate");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");

function saveState() {
  localStorage.setItem(stateKey, JSON.stringify(savedState));
}

function saveQuiz() {
  localStorage.setItem(quizKey, JSON.stringify(savedQuiz));
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

function renderNav() {
  modules.forEach((module) => {
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
    resultEl.textContent = savedQuiz[module.id];
  }
}

function renderModules() {
  modules.forEach((module) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.id = module.id;
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

    const quizItems = node.querySelector(".quiz-items");
    const resultEl = node.querySelector(".quiz-result");
    renderQuiz(module, quizItems, resultEl);

    node.querySelector(".ghost-btn").addEventListener("click", () => {
      let score = 0;
      module.quiz.forEach((question, index) => {
        const selected = node.querySelector(`input[name="${module.id}-${index}"]:checked`);
        if (selected && Number(selected.value) === question.answer) {
          score++;
        }
      });
      const message = `得分：${score} / ${module.quiz.length}。${score === module.quiz.length ? "很好，这一节可以勾选完成。" : "建议回到上面的讲解，把错题对应的段落再过一遍。"}`;
      resultEl.textContent = message;
      savedQuiz[module.id] = message;
      saveQuiz();
    });

    moduleContainer.appendChild(node);
  });
}

renderNav();
renderModules();
updateProgress();
