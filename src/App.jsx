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
  ArrowRightLeft
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
    { id: 'ch-1', title: '第1章 绪论', blocks: [] },
    { id: 'ch-2', title: '第2章 相关技术', blocks: [] },
    { id: 'ch-3', title: '第3章 系统设计', blocks: [] },
  ],
  addChapter: (title) => set((state) => ({
    chapters: [...state.chapters, { id: `ch-${Date.now()}`, title, blocks: [] }]
  })),
  removeChapter: (id) => set((state) => ({
    chapters: state.chapters.filter(ch => ch.id !== id)
  })),
  setChapters: (chapters) => set({ chapters }),
  addBlock: (chapterId, blockType, prompt = "", content = "") => set((state) => ({
    chapters: state.chapters.map(ch =>
      ch.id === chapterId
        ? { ...ch, blocks: [...ch.blocks, { id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, type: blockType, prompt, content, isGenerating: false }] }
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
  const { chapters, addChapter, removeChapter, addBlock, updateBlock, removeBlock, reorderBlocks, setChapters } = useThesisStore();
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');

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
    // 重置 input 以便下次选择同一文件
    event.target.value = null;
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

  const handleGenerate = (chapterId, blockId, prompt, type) => {
    updateBlock(chapterId, blockId, { isGenerating: true });
    setTimeout(() => {
      let content = "";
      if (type === 'text-block') {
        content = `针对“${prompt || '研究背景'}”的深入分析表明，在当前的计算机工程实践中，如何有效平衡系统性能与架构复杂度是一个持续性挑战。本课题通过引入“${prompt}”模型，成功在降低了30%服务延迟的同时，确保了代码的可维护性。这一成果不仅满足了毕业论文的学术广度，更在实际的原型系统中得到了性能验证，为同类毕设项目提供了标准化的组件参考原型。`;
      } else {
        content = prompt || TYPE_MAP[type];
      }
      updateBlock(chapterId, blockId, { content, isGenerating: false });
    }, 1000);
  };

  const exportToWord = async () => {
    const children = [];
    chapters.forEach((ch, idx) => {
      children.push(new Paragraph({ text: ch.title, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
      ch.blocks.forEach(blk => {
        if (blk.type === 'text-block') {
          children.push(new Paragraph({ text: blk.content || "(待生成内容)", spacing: { after: 120 } }));
        } else if (blk.type === 'table') {
          children.push(new Paragraph({ text: `表 ${idx + 1}-X：${blk.content || '数据统计表'}`, alignment: 'center' }));
          children.push(new Table({
            width: { size: 100, type: 'pct' }, rows: [
              new TableRow({ children: [new TableCell({ children: [new Paragraph("测试项")] }), new TableCell({ children: [new Paragraph("结果")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("功能测试")] }), new TableCell({ children: [new Paragraph(blk.content || "Pass")] })] }),
            ]
          }));
        } else {
          children.push(new Paragraph({ text: `图 ${idx + 1}-X：${blk.content || TYPE_MAP[blk.type]}`, alignment: 'center' }));
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
            <div className="p-4 border-b"><h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">组件工厂</h2></div>
            <Droppable droppableId="SIDEBAR" isDropDisabled={true}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="p-3 space-y-2">
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
                    <h3 className="text-xs font-black text-slate-800">{ch.title}</h3>
                    <button onClick={() => removeChapter(ch.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>
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
                                  <span className="text-[8px] font-black text-slate-400 uppercase">{TYPE_MAP[blk.type]}</span>
                                  <button onClick={() => removeBlock(ch.id, blk.id)} className="text-slate-300 hover:text-red-400"><Trash2 size={12} /></button>
                                </div>
                                <input type="text" placeholder="输入关键词 (如：需求分析)..." className="w-full text-[11px] p-2 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-300" onKeyDown={(e) => e.key === 'Enter' && handleGenerate(ch.id, blk.id, e.target.value, blk.type)} />
                                {blk.isGenerating && <div className="text-[9px] text-blue-500 animate-pulse mt-2 flex items-center"><Activity size={10} className="mr-1 shadow-sm" />生成中...</div>}
                                {blk.content && !blk.isGenerating && <div className="text-[9px] text-green-500 mt-2 flex items-center font-bold tracking-tight"><CheckCircle2 size={10} className="mr-1" />内容已同步至预览</div>}
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

          {/* 右侧：预览区 */}
          <section className="flex-1 bg-slate-200 p-8 overflow-y-auto flex flex-col items-center">
            <div className="w-[800px] bg-white shadow-2xl min-h-[1131px] p-24 rounded-sm flex flex-col flex-none h-fit mb-8 relative">
              <header className="mb-12 border-b-2 border-slate-800 pb-8 text-center"><h1 className="text-3xl font-bold text-slate-900 uppercase">毕业论文稿</h1><p className="text-[10px] text-slate-400 mt-2 font-mono">THESISFLOW AUTOMATED PREVIEW</p></header>
              <div className="space-y-12">
                {chapters.map((ch, idx) => (
                  <div key={ch.id}>
                    <h2 className="text-xl font-bold text-slate-900 mb-6 border-l-4 border-blue-600 pl-3 leading-none">{ch.title}</h2>
                    <div className="space-y-6">
                      {ch.blocks.map(blk => (
                        <div key={blk.id} className="animate-in fade-in slide-in-from-bottom-2">
                          {blk.type === 'text-block' ? (
                            <p className={`text-slate-700 leading-relaxed text-justify indent-8 ${!blk.content ? 'opacity-20 italic text-sm' : ''}`}>{blk.content || '请输入指令关键词生产核心文本内容...'}</p>
                          ) : blk.type === 'table' ? (
                            <div className="my-6">
                              <p className="text-sm font-bold text-slate-800 text-center mb-4">表 {idx + 1}-X：{blk.content || '数据统计表'}</p>
                              <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-slate-50 border-b border-slate-200 font-bold">
                                    <tr><th className="px-4 py-2">测试项 / 指标</th><th className="px-4 py-2">详细结果 / 描述</th></tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200">
                                    <tr><td className="px-4 py-2 bg-slate-50/30">功能性验证</td><td className="px-4 py-2">{blk.content || '待评估...'}</td></tr>
                                    <tr><td className="px-4 py-2 bg-slate-50/30">性能压力测试</td><td className="px-4 py-2">通过 (延迟 35ms)</td></tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="w-full bg-slate-50 border border-slate-100 aspect-video rounded-xl mb-3 flex flex-col items-center justify-center text-slate-300 relative overflow-hidden group">
                                {blk.content && blk.content.startsWith('data:image') ? (
                                  <img src={blk.content} className="w-full h-full object-contain" alt="导入图片" />
                                ) : (
                                  <>
                                    {blk.type === 'diag-arch' && <Cpu size={48} className="opacity-10" />}
                                    {blk.type === 'diag-usecase' && <Users size={48} className="opacity-10" />}
                                    {blk.type === 'diag-seq' && <ArrowRightLeft size={48} className="opacity-10" />}
                                    {blk.type === 'diag-flow' && <Activity size={48} className="opacity-10" />}
                                    {blk.type === 'diag-er' && <Database size={48} className="opacity-10" />}
                                    {blk.type === 'diag-class' && <Box size={48} className="opacity-10" />}
                                    {blk.type === 'diag-state' && <CircleDot size={48} className="opacity-10" />}
                                    {blk.type === 'diag-ui' && <Monitor size={48} className="opacity-10" />}
                                    <span className="text-[10px] uppercase font-bold tracking-widest mt-4 opacity-50">{TYPE_MAP[blk.type]} 占位符</span>
                                  </>
                                )}
                              </div>
                              <p className="text-sm font-bold text-slate-800">图 {idx + 1}-X：{blk.content || TYPE_MAP[blk.type]}</p>
                            </div>
                          )}
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
