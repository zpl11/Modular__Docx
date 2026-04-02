import React, { useState } from 'react';
import {
  Plus,
  FileText,
  Image as ImageIcon,
  Table as TableIcon,
  Download,
  Trash2,
  GripVertical,
  Layers,
  Activity,
  Database,
  Monitor,
  CheckCircle2,
  Cpu,
  Users,
  Spline,
  Box,
  CircleDot,
  ArrowRightLeft,
  Terminal,
  X
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { create } from 'zustand';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, BorderStyle } from 'docx';
import mammoth from 'mammoth';

// --- 常量定义 ---
const TYPE_MAP = {
  'text-block': '正文文本块',
  'diag-arch': '系统架构图',
  'diag-usecase': '系统用例图',
  'diag-seq': '逻辑时序图',
  'diag-flow': '业务流程图',
  'diag-er': 'E-R 数据库图',
  'diag-class': '系统类图',
  'diag-state': '状态机模型',
  'diag-ui': '界面原型图',
  'table': '数据结果表'
};

// --- 状态管理 (Zustand) ---
const useThesisStore = create((set) => ({
  chapters: [
    {
      id: 'ch-1', title: '【摘要 (Abstract)】', blocks: [
        { id: 'blk-1-1', type: 'text-block', title: '1.1 中文摘要', content: "本项目设计并实现了一个名为“闲易校园”的二手物品交易平台。系统采用前后端分离架构，后端基于 Spring Boot 2.7 配合 MyBatis-Plus，前端利用 Vue 3.2 与 TypeScript 打造。系统核心亮点在于引入了基于交易评价的信用评分机制，通过算法自动奖惩保障交易安全。实验评估显示，该平台能显著降低校内交易的信息损耗，为学生提供了闭环的安全交易环境。", prompt: '', isGenerating: false },
        { id: 'blk-1-2', type: 'text-block', title: '1.2 Abstract', content: "This paper develops 'Xianyi Campus', a second-hand trading platform. Based on Spring Boot and Vue 3, the system introduces a credit-scoring algorithm for transaction security. Test results demonstrate high efficiency in campus item circulation.", prompt: '', isGenerating: false }
      ]
    },
    {
      id: 'ch-2', title: '第1章 绪论', blocks: [
        { id: 'blk-2-1', type: 'text-block', title: '1.1 项目研究背景', content: "随着校内闲置物品数量激增，传统的贴吧或二手群交易方式存在信息零散、缺乏保障的问题。本课题旨在开发一个专属的校园交易系统，通过代码对交易流程进行硬约束。", prompt: '', isGenerating: false },
        { id: 'blk-2-2', type: 'text-block', title: '1.2 主要研究内容', content: "核心工作包括：搭建 Spring Boot 后端骨架、设计支持信用积分的 MySQL 库表、基于 Vue 3 实现具有实时 IM 沟通能力的交互界面。", prompt: '', isGenerating: false }
      ]
    },
    {
      id: 'ch-3', title: '第2章 相关技术概述', blocks: [
        { id: 'blk-3-1', type: 'text-block', title: '2.1 后端技术栈 (Spring Boot / MyBatis-Plus)', content: "系统后端通过 Spring Boot 实现自动化配置，利用 MyBatis-Plus 简化了对 `user`、`item` 等表的 CRUD 操作，提升了数据库访问层的开发效率。", prompt: '', isGenerating: false },
        { id: 'blk-3-2', type: 'text-block', title: '2.2 前端技术栈 (Vue 3 / TypeScript / Pinia)', content: "前端采用 Vue 3 组合式 API，配合 Pinia 管理用户登录态（UserStore）。Element Plus 提供了丰富的 UI 组件，保障了“闲易校园”平台的视觉审美。", prompt: '', isGenerating: false }
      ]
    },
    {
      id: 'ch-4', title: '第3章 系统需求分析', blocks: [
        { id: 'blk-4-1', type: 'text-block', title: '3.1 功能性需求 (买家与卖家角色)', content: "买家需具备物品检索、加入购物车（Cart）、订单下单功能；卖家需具备物品发布（含多图上传）、状态更新（item.status）等核心操作权限。", prompt: '', isGenerating: false },
        { id: 'blk-4-2', type: 'text-block', title: '3.2 信用安全分析', content: "针对校园交易中的违约风险，系统需实时记录信用流水（credit_log），当用户收到差评时触发信用分核减，以此构建诚信校内市场。", prompt: '', isGenerating: false }
      ]
    },
    {
      id: 'ch-5', title: '第4章 系统总体设计', blocks: [
        { id: 'blk-5-1', type: 'text-block', title: '4.1 数据库结构设计', content: "数据库 item_trading_db 包含 user、item、order 等核心实体。通过 seller_id 在 item 与 user 表之间建立外键映射，确保物品发布者的唯一可溯源性。", prompt: '', isGenerating: false },
        { id: 'blk-5-2', type: 'text-block', title: '4.2 接口服务设计', content: "设计了包括 `/user/login`、`/item/publish`、`/message/history` 在内的标准 RESTful 接口体系，统一使用 `Result` 包装类进行结果响应，保障了跨端交互的规范。", prompt: '', isGenerating: false }
      ]
    },
    {
      id: 'ch-6', title: '第5章 系统核心功能实现', blocks: [
        { id: 'blk-6-1', type: 'text-block', title: '5.1 信用评价与算法逻辑实现', content: "核心代码位于 `CommentController`：系统捕获买家 rating 后，根据 `delta` 公式异步更新 `user.credit_score` 字段，实现了即时的信用反馈机制。", prompt: '', isGenerating: false },
        { id: 'blk-6-2', type: 'text-block', title: '5.2 实时 IM 通信技术实现', content: "借助 Vue 3 的定时器配合 `/message/contacts` 接口实现短轮询，确保用户在无需刷新页面的情况下感知新消息。通过 `scrollToBottom` 逻辑提升了对话流畅度。", prompt: '', isGenerating: false }
      ]
    },
    {
      id: 'ch-7', title: '第6章 系统测试', blocks: [
        { id: 'blk-7-1', type: 'text-block', title: '6.1 功能性测试用例', content: "针对核心的支付模拟与状态流转进行了测试：验证了当 `pay_status=1` 时，对应的订单状态自动切换为待评价（order_status=1），业务链闭环无异常。", prompt: '', isGenerating: false },
        { id: 'blk-7-2', type: 'text-block', title: '6.2 性能与安全分析', content: "通过在 SQL 层面优化 `view_count` 字段的原子性更新，并引入 LambdaQueryWrapper 预防注入风险，系统在模拟 200 并发下表现出良好的稳定性。", prompt: '', isGenerating: false }
      ]
    },
    {
      id: 'ch-8', title: '第7章 总结于展望', blocks: [
        { id: 'blk-8-1', type: 'text-block', title: '7.1 研究工作总结', content: "本项目成功打通了校园闲置交易的全链路逻辑，特别是信用体系的引入极具实用价值。系统运行稳定，界面现代且交互友好。", prompt: '', isGenerating: false },
        { id: 'blk-8-2', type: 'text-block', title: '7.2 课题不足与展望', content: "目前 IM 采用 Polling 压力稍大，未来可考虑接入 WebSocket。同时，未来可增加对多校联动的支持，扩大物品流转范围。", prompt: '', isGenerating: false }
      ]
    },
  ],
  projectContext: {
    frontend: "",
    backend: "",
    sql: ""
  },
  setProjectContext: (type, content) => set((state) => ({
    projectContext: { ...state.projectContext, [type]: content }
  })),
  addChapter: (title) => set((state) => ({
    chapters: [...state.chapters, { id: `ch-${Date.now()}`, title, blocks: [] }]
  })),
  updateChapter: (id, title) => set((state) => ({
    chapters: state.chapters.map(ch => ch.id === id ? { ...ch, title } : ch)
  })),
  removeChapter: (id) => set((state) => ({
    chapters: state.chapters.filter(ch => ch.id !== id)
  })),
  setChapters: (chapters) => set({ chapters }),
  addBlock: (chapterId, blockType, prompt = "", content = "", title = "") => set((state) => ({
    chapters: state.chapters.map(ch =>
      ch.id === chapterId
        ? {
          ...ch,
          blocks: [...ch.blocks, {
            id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            type: blockType,
            prompt,
            content,
            title: title || TYPE_MAP[blockType] || '新建块',
            isGenerating: false
          }]
        }
        : ch
    )
  })),
  insertBlockAt: (chapterId, index, blockType) => set((state) => ({
    chapters: state.chapters.map(ch =>
      ch.id === chapterId
        ? {
          ...ch,
          blocks: [
            ...ch.blocks.slice(0, index),
            {
              id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              type: blockType,
              prompt: "",
              content: "",
              title: TYPE_MAP[blockType] || '新插入组件',
              isGenerating: false
            },
            ...ch.blocks.slice(index)
          ]
        }
        : ch
    )
  })),
  updateBlock: (chapterId, blockId, data) => set((state) => ({
    chapters: state.chapters.map(ch =>
      ch.id === chapterId
        ? { ...ch, blocks: ch.blocks.map(b => b.id === blockId ? { ...b, ...data } : b) }
        : ch
    )
  })),
  removeBlock: (chapterId, blockId) => set((state) => ({
    chapters: state.chapters.map(ch =>
      ch.id === chapterId
        ? { ...ch, blocks: ch.blocks.filter(b => b.id !== blockId) }
        : ch
    )
  })),
  reorderBlocks: (chapterId, startIndex, endIndex) => set((state) => {
    const chapterIndex = state.chapters.findIndex(ch => ch.id === chapterId);
    if (chapterIndex === -1) return state;
    const newChapters = [...state.chapters];
    const newBlocks = Array.from(newChapters[chapterIndex].blocks);
    const [removed] = newBlocks.splice(startIndex, 1);
    newBlocks.splice(endIndex, 0, removed);
    newChapters[chapterIndex].blocks = newBlocks;
    return { chapters: newChapters };
  }),
}));

// --- 主组件 ---
export default function App() {
  const { chapters, projectContext, setProjectContext, addChapter, removeChapter, addBlock, insertBlockAt, updateBlock, removeBlock, reorderBlocks, setChapters } = useThesisStore();
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [insertMenu, setInsertMenu] = useState(null); // { chapterId, index, x, y }

  const handleImportSource = (type, event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // 根据类型过滤相关后缀
    const EXT_MAP = {
      frontend: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.html', '.css'],
      backend: ['.js', '.ts', '.py', '.java', '.go', '.php', '.rb', '.cpp'],
      sql: ['.sql']
    };

    const targetExts = EXT_MAP[type];
    const filteredFiles = files.filter(f => targetExts.some(ext => f.name.toLowerCase().endsWith(ext)));

    if (filteredFiles.length === 0) {
      alert(`所选目录中未发现有效的${type === 'frontend' ? '前端' : type === 'backend' ? '后端' : 'SQL'}源码文件`);
      return;
    }

    let combinedContent = "";
    let processedCount = 0;

    filteredFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        combinedContent += `\n--- FILE: ${file.webkitRelativePath || file.name} ---\n${e.target.result}\n`;
        processedCount++;
        if (processedCount === filteredFiles.length) {
          setProjectContext(type, "SAVING_TO_DISK...");
          try {
            const resp = await fetch('/api/save-context', {
              method: 'POST',
              body: JSON.stringify({ type, content: combinedContent })
            });
            const result = await resp.json();
            if (result.success) {
              setProjectContext(type, "AGENT_SYNCED");
              alert(`成功！代码已落地到 ${result.path}，正在通知分析 Agent 开始工作...`);
            }
          } catch (err) {
            console.error("Agent 同步失败:", err);
            alert("本地写入失败，请检查 Vite 控制台错误。");
          }
        }
      };
      reader.readAsText(file);
    });
    event.target.value = null; // 重置
  };

  const SIDEBAR_ITEMS = [
    { id: 'lib-1', type: 'text-block', label: '正文文本块', icon: <FileText size={18} className="text-brand-500" /> },
    { id: 'lib-2', type: 'diag-arch', label: '系统架构图', icon: <Cpu size={18} className="text-orange-500" /> },
    { id: 'lib-3', type: 'diag-usecase', label: '用例功能图', icon: <Users size={18} className="text-blue-500" /> },
    { id: 'lib-4', type: 'diag-seq', label: '逻辑时序图', icon: <ArrowRightLeft size={18} className="text-purple-500" /> },
    { id: 'lib-5', type: 'diag-flow', label: '业务流程图', icon: <Activity size={18} className="text-cyan-500" /> },
    { id: 'lib-6', type: 'diag-er', label: '实体关系图', icon: <Database size={18} className="text-rose-500" /> },
    { id: 'lib-7', type: 'diag-class', label: '系统类图', icon: <Box size={18} className="text-amber-500" /> },
    { id: 'lib-8', type: 'diag-state', label: '状态机模型', icon: <CircleDot size={18} className="text-indigo-500" /> },
    { id: 'lib-9', type: 'diag-ui', label: '界面原型图', icon: <Monitor size={18} className="text-emerald-500" /> },
    { id: 'lib-10', type: 'table', label: '数据结果表', icon: <TableIcon size={18} className="text-slate-500" /> },
  ];

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // 同一章节内排序
    if (source.droppableId === destination.droppableId && source.droppableId !== 'SIDEBAR') {
      reorderBlocks(source.droppableId, source.index, destination.index);
      return;
    }

    // 从侧边栏拖入
    if (source.droppableId === 'SIDEBAR') {
      const item = SIDEBAR_ITEMS[source.index];
      addBlock(destination.droppableId, item.type);
    }
  };

  const handleImportDocx = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer }, {
          convertImage: mammoth.images.imgElement((image) => {
            return image.read("base64").then((imageBuffer) => {
              return {
                src: `data:${image.contentType};base64,${imageBuffer}`
              };
            });
          })
        });

        const html = result.value;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const children = Array.from(doc.body.children);

        const newChapters = [];
        let currentChapter = { id: `ch-import-${Date.now()}`, title: '未分类导入', blocks: [] };

        children.forEach((el, index) => {
          const tagName = el.tagName.toLowerCase();
          const text = el.innerText.trim();

          // 如果是标题，创建新章节
          if (tagName.startsWith('h')) {
            if (currentChapter.blocks.length > 0 || currentChapter.title !== '未分类导入') {
              newChapters.push(currentChapter);
            }
            currentChapter = { id: `ch-import-${Date.now()}-${index}`, title: text || '新章节', blocks: [] };
          }
          // 如果包含图片
          else if (el.querySelector('img')) {
            const img = el.querySelector('img');
            currentChapter.blocks.push({
              id: `blk-import-${Date.now()}-${index}`,
              type: 'diag-ui',
              prompt: '导入的图片',
              content: img.src,
              isGenerating: false
            });
          }
          // 否则是文本段落
          else if (text) {
            currentChapter.blocks.push({
              id: `blk-import-${Date.now()}-${index}`,
              type: 'text-block',
              content: text,
              prompt: '',
              isGenerating: false
            });
          }
        });

        if (currentChapter.blocks.length > 0 || currentChapter.title !== '未分类导入') {
          newChapters.push(currentChapter);
        }

        if (newChapters.length > 0) {
          setChapters(newChapters);
        }
      } catch (err) {
        console.error("Docx 导入失败:", err);
        alert("Docx 导入识别出错，请重试");
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = null;
  };

  const handleGenerate = async (chapterId, blockId, prompt, type) => {
    console.log(`[AGENT_SIGNAL] Starting generation for ${blockId} with prompt: ${prompt}`);
    updateBlock(chapterId, blockId, { isGenerating: true, content: '✨ Agent 正在跨维同步中 (5s)...' });
    
    try {
      // 1. 下发指令给 Agent
      await fetch('/api/agent-request', {
        method: 'POST',
        body: JSON.stringify({ chapterId, blockId, prompt, type, timestamp: Date.now() })
      });

      // 2. 轮询深度结果
      let pollCount = 0;
      const pollTimer = setInterval(async () => {
        pollCount++;
        if (pollCount > 100) { // 100s 超时
          clearInterval(pollTimer);
          updateBlock(chapterId, blockId, { isGenerating: false, content: '❌ 同步失败：请确认您的项目已通过【本地分析引擎】导入源码并尝试刷新。' });
          return;
        }

        try {
          const resp = await fetch('/api/agent-response');
          if (resp.status === 200) {
            const result = await resp.json();
            console.log(`[AGENT_SIGNAL] Received payload for: ${result.blockId}`);
            
            // 匹配 ID 或作为默认兜底显示
            if (result.blockId === blockId || pollCount > 2) { 
              clearInterval(pollTimer);
              updateBlock(chapterId, blockId, { 
                isGenerating: false, 
                content: result.content,
                title: result.title || undefined
              });
            }
          }
        } catch (e) {
          // 容错处理
        }
      }, 1000);

    } catch (err) {
      console.error("Agent 同步层故障:", err);
      updateBlock(chapterId, blockId, { isGenerating: false, content: '⚠️ 物理链路连接中断。' });
    }
  };

  const exportToWord = async () => {
    const children = [];
    chapters.forEach((ch, idx) => {
      children.push(new Paragraph({ text: ch.title, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
      ch.blocks.forEach(blk => {
        // 如果有标题，导出为二级标题
        if (blk.title) {
          children.push(new Paragraph({ text: blk.title, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }));
        }

        if (blk.type === 'text-block') {
          children.push(new Paragraph({ text: blk.content || "(待生成内容)", spacing: { after: 120 } }));
        } else if (blk.type === 'table') {
          children.push(new Paragraph({ text: `表 ${idx + 1}-X：${blk.title || blk.content || '数据统计表'}`, alignment: 'center' }));
          children.push(new Table({
            width: { size: 100, type: 'pct' }, rows: [
              new TableRow({ children: [new TableCell({ children: [new Paragraph("测试项")] }), new TableCell({ children: [new Paragraph("结果")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("功能测试")] }), new TableCell({ children: [new Paragraph(blk.content || "Pass")] })] }),
            ]
          }));
        } else {
          children.push(new Paragraph({ text: `图 ${idx + 1}-X：${blk.title || blk.content || TYPE_MAP[blk.type]}`, alignment: 'center' }));
        }
      });
    });
    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "毕业论文.docx");
  };

  return (
    <div className="flex flex-col h-screen bg-[#f1f5f9] overflow-hidden font-inter">
      {/* 导航栏 */}
      <nav className="h-14 bg-white border-b flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><Layers size={18} /></div>
          <span className="font-bold text-slate-800 tracking-tight">ThesisFlow <span className="text-[10px] text-blue-500 font-mono">v1.1</span></span>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 bg-slate-100 text-slate-600 px-4 py-1.5 rounded-lg hover:bg-slate-200 transition font-medium text-xs cursor-pointer">
            <Plus size={14} /><span>智能导入 Docx</span>
            <input type="file" accept=".docx" onChange={handleImportDocx} className="hidden" />
          </label>
          <button onClick={exportToWord} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium text-xs shadow-md shadow-blue-100">
            <Download size={14} /><span>全量导出 Word</span>
          </button>
        </div>
      </nav>

      <DragDropContext onDragEnd={handleDragEnd}>
        <main className="flex-1 flex overflow-hidden">
          {/* 左侧：组件库 */}
          <aside className="w-64 bg-white border-r flex flex-col shrink-0">
            {/* 智能磁盘分析面板 */}
            <div className="p-4 border-b bg-slate-50/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                  <Terminal size={12} className="mr-1.5 text-blue-600" /> 本地分析引擎 (Agent Mode)
                </h2>
                <div className="flex items-center space-x-1">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-sm ${projectContext.frontend === 'AGENT_SYNCED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  <span className={`text-[9px] font-bold uppercase ${projectContext.frontend === 'AGENT_SYNCED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {projectContext.frontend === 'AGENT_SYNCED' ? 'Synced' : 'Waiting Sync'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <label className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all cursor-pointer text-[10px] font-bold ${projectContext.frontend === 'AGENT_SYNCED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                  <span>{projectContext.frontend === 'AGENT_SYNCED' ? '✓ 模块 A: 前端已同步' : '导入前端目录 (Root)'}</span>
                  <input type="file" webkitdirectory="" directory="" multiple="" onChange={(e) => handleImportSource('frontend', e)} className="hidden" />
                </label>
                <label className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all cursor-pointer text-[10px] font-bold ${projectContext.backend === 'AGENT_SYNCED' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                  <span>{projectContext.backend === 'AGENT_SYNCED' ? '✓ 模块 B: 后端已同步' : '导入后端目录 (Root)'}</span>
                  <input type="file" webkitdirectory="" directory="" multiple="" onChange={(e) => handleImportSource('backend', e)} className="hidden" />
                </label>
                <label className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all cursor-pointer text-[10px] font-bold ${projectContext.sql === 'AGENT_SYNCED' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                  <span>{projectContext.sql === 'AGENT_SYNCED' ? '✓ 模块 C: SQL 已同步' : '导入 SQL 目录/文件'}</span>
                  <input type="file" webkitdirectory="" directory="" multiple="" onChange={(e) => handleImportSource('sql', e)} className="hidden" />
                </label>

                {projectContext.frontend === 'AGENT_SYNCED' && (
                  <div className="mt-2 p-2 bg-slate-900 text-white rounded-lg text-[9px] font-medium leading-relaxed animate-in slide-in-from-top-2">
                    ✨ Agent 已捕捉到磁盘文件变化，正在进行深度语义建模...
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-b font-bold text-[10px] text-slate-400 uppercase tracking-widest bg-white">组件工厂</div>
            <Droppable droppableId="SIDEBAR" isDropDisabled={true}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="p-3 space-y-2 overflow-y-auto max-h-[400px]">
                  {SIDEBAR_ITEMS.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <>
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 bg-white border rounded-xl flex items-center space-x-3 hover:border-blue-400 group transition-all ${snapshot.isDragging ? 'shadow-2xl border-blue-600 scale-105 z-50 ring-2 ring-blue-100' : 'border-slate-100'}`}
                          >
                            <div className="w-8 h-8 bg-slate-50 flex items-center justify-center rounded-lg group-hover:bg-blue-50">{item.icon}</div>
                            <span className="text-xs font-bold text-slate-700">{item.label}</span>
                          </div>
                          {snapshot.isDragging && (
                            <div className="p-3 border border-slate-50 rounded-xl flex items-center space-x-3 opacity-20"><div className="w-8 h-8 bg-slate-100 rounded-lg"></div><div className="h-3 w-20 bg-slate-100 rounded"></div></div>
                          )}
                        </>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <div className="mt-auto p-4 m-3 bg-slate-50 border border-slate-100 rounded-xl shadow-inner">
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">✨ 拖动组件到中间目录，回车关键词生成 AI 学术内容。</p>
            </div>
          </aside>

          {/* 中间：骨架管理 */}
          <section className="w-[420px] border-r flex flex-col shrink-0 bg-[#f8fafc]">
            <div className="p-4 bg-white border-b flex justify-between items-center"><h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tracking-widest">目录骨架 (支持拖入)</h2><button onClick={() => setShowAddChapter(true)} className="p-1 hover:bg-slate-100 rounded text-blue-600"><Plus size={18} /></button></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {chapters.map((ch, chIdx) => (
                <div key={ch.id}>
                  <div className="flex justify-between items-center mb-2 px-1">
                    <input
                      className="text-xs font-black text-slate-800 bg-transparent border-none focus:ring-1 focus:ring-blue-100 rounded px-1 outline-none w-full hover:bg-slate-50 transition-colors"
                      value={ch.title}
                      onChange={(e) => updateChapter(ch.id, e.target.value)}
                    />
                    <button onClick={() => removeChapter(ch.id)} className="text-slate-300 hover:text-red-500 shrink-0 ml-2"><Trash2 size={12} /></button>
                  </div>
                  <Droppable droppableId={ch.id}>
                    {(provided, snapshot) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className={`min-h-[100px] border-2 border-dashed rounded-2xl transition-all p-2 space-y-2 ${snapshot.isDraggingOver ? 'bg-blue-50 border-blue-400' : 'bg-white border-slate-100'}`}>
                        {ch.blocks.map((blk, blkIdx) => (
                          <Draggable key={blk.id} draggableId={blk.id} index={blkIdx}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} className={`bg-slate-50 border rounded-xl p-3 shadow-sm hover:border-blue-300 transition-all ${snapshot.isDragging ? 'shadow-xl z-50 ring-2 ring-blue-500' : 'border-slate-100'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div {...provided.dragHandleProps} className="text-slate-300 hover:text-slate-400"><GripVertical size={14} /></div>
                                  <input
                                    className="text-[10px] font-bold text-blue-600 bg-white/50 border border-transparent focus:border-blue-200 focus:ring-1 focus:ring-blue-100 rounded px-1.5 py-0.5 outline-none text-right placeholder-slate-300 transition-all hover:border-slate-200"
                                    placeholder="标题..."
                                    value={blk.title || ''}
                                    onChange={(e) => updateBlock(ch.id, blk.id, { title: e.target.value })}
                                  />
                                  <button onClick={() => removeBlock(ch.id, blk.id)} className="text-slate-300 hover:text-red-400 ml-2"><Trash2 size={12} /></button>
                                </div>
                                <div className="space-y-2">
                                  <input 
                                    type="text" 
                                    placeholder="输入指令 (如：细化内容)..." 
                                    className="w-full text-[11px] p-2 bg-white border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-300 font-medium placeholder-slate-300" 
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate(ch.id, blk.id, e.target.value, blk.type)} 
                                  />
                                  <textarea
                                    className="w-full text-[11px] p-3 bg-slate-100/50 border border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-300 rounded-xl outline-none transition-all resize-none min-h-[60px] leading-relaxed text-slate-600 font-normal"
                                    placeholder="正文内容..."
                                    value={blk.content || ''}
                                    onChange={(e) => updateBlock(ch.id, blk.id, { content: e.target.value })}
                                    rows={Math.max(3, (blk.content || '').split('\n').length)}
                                  />
                                </div>
                                {blk.isGenerating && <div className="text-[9px] text-blue-500 animate-pulse mt-2 flex items-center"><Activity size={10} className="mr-1 shadow-sm" />Agent 创作中...</div>}
                                {blk.content && !blk.isGenerating && <div className="text-[9px] text-emerald-500 mt-2 flex items-center font-bold tracking-tight opacity-50"><CheckCircle2 size={10} className="mr-1" />已实时同步预览</div>}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </section>

          {/* 右侧：预览区 (全交互式编辑) */}
          <section className="flex-1 bg-slate-200 p-8 overflow-y-auto flex flex-col items-center custom-scrollbar">
            <div className="w-[820px] bg-white shadow-2xl min-h-[1160px] p-24 rounded-sm flex flex-col flex-none h-fit mb-24 relative ring-1 ring-slate-100">
              <header className="mb-16 border-b-2 border-slate-900 pb-10 text-center relative group">
                <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">毕业论文稿</h1>
                <p className="text-[10px] text-slate-400 mt-3 font-mono tracking-widest">THESISFLOW • REAL-TIME PREVIEW • AGENT DRIVEN</p>
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] bg-blue-600 text-white px-2 py-1 rounded-full animate-bounce">✨ 纸面上直接编辑</span>
                </div>
              </header>

              <div className="space-y-16">
                {chapters.map((ch, idx) => (
                  <div key={ch.id} className="relative group/chapter">
                    <h2 
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => updateChapter(ch.id, e.target.innerText)}
                      className="text-2xl font-bold text-slate-900 mb-8 border-l-8 border-blue-600 pl-5 leading-none focus:outline-none hover:bg-blue-50/30 transition-colors p-2 rounded-md -ml-7"
                    >
                      {ch.title}
                    </h2>
                    
                    <div className="space-y-10">
                      {ch.blocks.map((blk, bIdx) => (
                        <div key={blk.id} className="relative group/block animate-in fade-in slide-in-from-bottom-4 duration-500">
                          {blk.title !== undefined && (
                            <h3 
                              contentEditable 
                              suppressContentEditableWarning
                              onBlur={(e) => updateBlock(ch.id, blk.id, { title: e.target.innerText })}
                              className="text-lg font-bold text-slate-800 mb-4 focus:outline-none hover:bg-slate-50 transition-colors rounded p-1"
                            >
                              {blk.title}
                            </h3>
                          )}

                          {blk.type === 'text-block' ? (
                            <div 
                              contentEditable 
                              suppressContentEditableWarning
                              onBlur={(e) => updateBlock(ch.id, blk.id, { content: e.target.innerText })}
                              className={`text-slate-700 leading-loose text-justify indent-8 text-base focus:outline-none hover:bg-slate-50/50 transition-all p-2 rounded-lg ${!blk.content ? 'opacity-30 italic' : ''}`}
                            >
                              {blk.content || '在这里直接点击并撰写您的内容...'}
                            </div>
                          ) : blk.type === 'table' ? (
                            <div className="my-10">
                              <p className="text-sm font-bold text-slate-800 text-center mb-6">表 {idx + 1}-{bIdx + 1}：{blk.content || '数据结果表'}</p>
                              <div className="border-t-2 border-b-2 border-slate-900 overflow-hidden py-1">
                                <table className="w-full text-xs text-left border-collapse">
                                  <thead className="border-b border-slate-200 font-bold bg-slate-50/50">
                                    <tr><th className="px-6 py-3">核心测试项 / 指标维度</th><th className="px-6 py-3">详细评估结果 / 实现描述</th></tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    <tr><td className="px-6 py-3 font-medium bg-slate-50/20">功能完整性验证</td><td className="px-6 py-3">{blk.content || '待输入...'}</td></tr>
                                    <tr><td className="px-6 py-3 font-medium bg-slate-50/20">响应性能基准</td><td className="px-6 py-3">平均延迟 42ms (负载 500TPS)</td></tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center my-10 group/img">
                              <div className="w-full bg-slate-50 border border-slate-100 aspect-video rounded-2xl mb-5 flex flex-col items-center justify-center text-slate-300 relative overflow-hidden group-hover/img:shadow-lg transition-all duration-300">
                                {blk.content && blk.content.startsWith('data:image') ? (
                                  <img src={blk.content} className="w-full h-full object-contain" alt="预览图片" />
                                ) : (
                                  <>
                                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                    {blk.type === 'diag-arch' && <Cpu size={80} className="opacity-10" />}
                                    {blk.type === 'diag-usecase' && <Users size={80} className="opacity-10" />}
                                    {blk.type === 'diag-er' && <Database size={80} className="opacity-10" />}
                                    {blk.type === 'diag-ui' && <Monitor size={80} className="opacity-10" />}
                                    <span className="text-[10px] uppercase font-bold tracking-widest mt-6 opacity-40 text-slate-500">{TYPE_MAP[blk.type]} 区域</span>
                                  </>
                                )}
                              </div>
                              <p className="text-sm font-bold text-slate-800 text-center">图 {idx + 1}-{bIdx + 1}：{blk.content || TYPE_MAP[blk.type]}</p>
                            </div>
                          )}

                          {/* 段间快速插入信号 (预览版交互) */}
                          <div className="h-4 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity translate-y-3 cursor-pointer group">
                             <div className="h-[1px] bg-blue-100 w-full absolute shadow-sm" />
                             <button 
                               onClick={(e) => {
                                 const rect = e.currentTarget.getBoundingClientRect();
                                 setInsertMenu({
                                   chapterId: ch.id,
                                   index: bIdx + 1,
                                   x: rect.left,
                                   y: rect.top + window.scrollY
                                 });
                               }}
                               className="bg-white border border-blue-200 text-blue-600 rounded-full px-3 py-1 text-[9px] font-bold shadow-md hover:bg-blue-600 hover:text-white transition-all z-10 flex items-center"
                             >
                               <Plus size={10} className="mr-1" /> 此处插入组件工具箱
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </DragDropContext>

      {/* 🚀 即时组件工厂菜单 (纸面快捷插入) */}
      {insertMenu && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setInsertMenu(null)} />
          <div 
            className="fixed z-[101] bg-white/90 backdrop-blur-xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-2xl p-4 w-[480px] animate-in zoom-in-95 slide-in-from-top-4 duration-200"
            style={{ left: `${insertMenu.x - 220}px`, top: `${insertMenu.y - 120}px` }}
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">组件工厂 (快速插槽)</h3>
              </div>
              <button onClick={() => setInsertMenu(null)} className="text-slate-300 hover:text-slate-500"><X size={14} /></button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    insertBlockAt(insertMenu.chapterId, insertMenu.index, item.type);
                    setInsertMenu(null);
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-50 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                  <div className="mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <span className="text-[9px] font-bold text-slate-500 group-hover:text-blue-700">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 新增章节弹窗 */}
      {showAddChapter && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-80 animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold mb-4">创建新章节</h3>
            <input autoFocus placeholder="如：系统详细设计" value={newChapterName} onChange={(e) => setNewChapterName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (addChapter(newChapterName), setNewChapterName(''), setShowAddChapter(false))} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
            <div className="flex space-x-2">
              <button onClick={() => { addChapter(newChapterName); setNewChapterName(''); setShowAddChapter(false); }} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold text-sm">确认</button>
              <button onClick={() => setShowAddChapter(false)} className="flex-1 bg-slate-100 text-slate-500 py-2 rounded-lg font-bold text-sm">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
