import React, { useState } from 'react';
import { Subject, QuestionType, DifficultyLevel, ExamConfig, GradingConfig } from '../types';
import { Loader2, Upload, FileText, CheckCircle, GraduationCap, LayoutTemplate, X, Files, Layers } from 'lucide-react';

interface ControlPanelProps {
  onGenerate: (config: ExamConfig) => void;
  onGrade: (config: GradingConfig) => void;
  isLoading: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onGenerate, onGrade, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'grade'>('create');
  
  // Header Info State
  const [faculty, setFaculty] = useState('Công nghệ thông tin');
  const [department, setDepartment] = useState('Khoa học máy tính');
  const [targetAudience, setTargetAudience] = useState('Sinh viên đại học chính quy');
  const [duration, setDuration] = useState('60');
  const [signerTitle, setSignerTitle] = useState('TRƯỞNG BỘ MÔN');
  const [signerName, setSignerName] = useState('Nguyễn Văn A');

  // Generation State
  const [subject, setSubject] = useState<string>('Vật lý');
  const [topic, setTopic] = useState('');
  const [specific, setSpecific] = useState('');
  const [qType, setQType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
  const [level, setLevel] = useState<DifficultyLevel>(DifficultyLevel.RECOGNITION);
  const [quantity, setQuantity] = useState(5);
  
  // Matrix State (For Essay)
  const [variantCount, setVariantCount] = useState(1);
  const [matrixCounts, setMatrixCounts] = useState({
      [DifficultyLevel.RECOGNITION]: 1,
      [DifficultyLevel.UNDERSTANDING]: 1,
      [DifficultyLevel.APPLICATION]: 1,
      [DifficultyLevel.ADVANCED_APPLICATION]: 0
  });

  // Source Files State (Array)
  const [sourceFiles, setSourceFiles] = useState<File[]>([]);

  // Grading State
  const [gradingType, setGradingType] = useState<'trac-nghiem' | 'tu-luan'>('trac-nghiem');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [gradeError, setGradeError] = useState<string | null>(null);

  const handleGenerate = () => {
    // Calculate total if in Matrix mode
    const isEssay = qType === QuestionType.ESSAY;
    const finalQuantity = isEssay 
        ? Object.values(matrixCounts).reduce((a: number, b: number) => a + b, 0)
        : quantity;

    onGenerate({
      subject,
      topic,
      specificRequirement: specific,
      questionType: qType,
      difficulty: level,
      quantity: finalQuantity,
      sourceFiles,
      faculty,
      department,
      targetAudience,
      duration,
      signerTitle,
      signerName,
      // Pass matrix data if essay
      levelDistribution: isEssay ? matrixCounts : undefined,
      variantCount: isEssay ? variantCount : 1
    });
  };

  const handleGrade = () => {
    if (!submissionFile || !answerKeyFile) {
        setGradeError("Vui lòng tải lên cả bài thi và đáp án.");
        return;
    }
    setGradeError(null);
    onGrade({
        submissionFile,
        answerKeyFile,
        gradingType
    });
  };

  const handleAddSourceFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const newFiles = Array.from(e.target.files);
          setSourceFiles(prev => [...prev, ...newFiles]);
      }
  };

  const removeSourceFile = (index: number) => {
      setSourceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateMatrixCount = (lvl: DifficultyLevel, val: number) => {
      setMatrixCounts(prev => ({ ...prev, [lvl]: val >= 0 ? val : 0 }));
  };

  // Component for Single File Upload (used in Grading)
  const FileInput = ({ label, file, setFile }: { label: string, file: File | null, setFile: (f: File | null) => void }) => (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="relative group">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className={`border-2 border-dashed rounded-lg p-3 flex items-center justify-center transition-colors ${file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-400'}`}>
           {file ? (
               <div className="flex items-center text-green-700 truncate max-w-full">
                   <CheckCircle size={16} className="mr-2 flex-shrink-0" />
                   <span className="text-sm truncate">{file.name}</span>
               </div>
           ) : (
               <div className="flex items-center text-gray-500">
                   <Upload size={16} className="mr-2" />
                   <span className="text-sm">Chọn file tài liệu...</span>
               </div>
           )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 shadow-xl overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <GraduationCap className="w-6 h-6" />
          UniExam AI
        </h2>
        <p className="text-blue-100 text-xs mt-1 opacity-90">Trợ lý học thuật thông minh</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'create' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Cấu hình Đề thi
        </button>
        <button
          onClick={() => setActiveTab('grade')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'grade' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Chấm thi tự động
        </button>
      </div>

      <div className="p-5 flex-1 space-y-6">
        {activeTab === 'create' ? (
          <div className="space-y-4 animate-fadeIn">
            {/* Header Info Section */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h3 className="text-xs font-bold text-blue-700 uppercase mb-3 flex items-center gap-1">
                    <LayoutTemplate size={14} /> Thông tin tiêu đề (Header)
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Khoa</label>
                        <input type="text" value={faculty} onChange={(e) => setFaculty(e.target.value)} className="w-full p-1.5 text-xs border rounded" placeholder="VD: CNTT" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Bộ môn</label>
                        <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full p-1.5 text-xs border rounded" placeholder="VD: KHMT" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Đối tượng</label>
                        <input type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="w-full p-1.5 text-xs border rounded" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Thời gian (phút)</label>
                        <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-1.5 text-xs border rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Chức danh người ký</label>
                        <input type="text" value={signerTitle} onChange={(e) => setSignerTitle(e.target.value)} className="w-full p-1.5 text-xs border rounded" placeholder="VD: TRƯỞNG BỘ MÔN" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Họ tên người ký</label>
                        <input type="text" value={signerName} onChange={(e) => setSignerName(e.target.value)} className="w-full p-1.5 text-xs border rounded" placeholder="VD: Nguyễn Văn A" />
                    </div>
                </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Môn học</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ví dụ: Vật lý, Toán học đại cương..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-800 font-medium"
              />
            </div>

            {/* Multiple File Upload Section */}
            <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tài liệu nguồn ({sourceFiles.length} file)</label>
                 <div className="relative group mb-2">
                    <input
                        type="file"
                        multiple
                        onChange={handleAddSourceFiles}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg p-3 flex items-center justify-center transition-colors bg-white">
                        <div className="flex items-center text-gray-500">
                            <Files size={16} className="mr-2" />
                            <span className="text-sm">Chọn nhiều tài liệu...</span>
                        </div>
                    </div>
                </div>
                
                {/* File List */}
                {sourceFiles.length > 0 && (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded border border-gray-100">
                        {sourceFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-1.5 rounded shadow-sm border border-gray-100 text-xs">
                                <div className="flex items-center truncate">
                                    <FileText size={12} className="text-blue-500 mr-2 flex-shrink-0" />
                                    <span className="truncate max-w-[180px]" title={file.name}>{file.name}</span>
                                </div>
                                <button 
                                    onClick={() => removeSourceFile(index)} 
                                    className="text-gray-400 hover:text-red-500 ml-2"
                                    title="Xóa file"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chủ đề / Nội dung</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Từ trường, Tích phân..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Yêu cầu cụ thể</label>
              <textarea
                value={specific}
                onChange={(e) => setSpecific(e.target.value)}
                placeholder="VD: Xác định véc tơ cảm ứng từ..."
                rows={2}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
              />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loại câu hỏi</label>
                <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value as QuestionType)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium text-indigo-900 bg-indigo-50"
                >
                    {Object.values(QuestionType).map((t) => (
                    <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            {/* CONDITIONAL RENDERING: Matrix Mode for Essay vs Simple Mode for others */}
            {qType === QuestionType.ESSAY ? (
                <div className="bg-gradient-to-br from-indigo-50 to-white p-3 rounded-lg border border-indigo-200 animate-fadeIn">
                    <h3 className="text-xs font-bold text-indigo-700 uppercase mb-3 flex items-center gap-1">
                        <Layers size={14} /> Cấu trúc Ma trận Đề
                    </h3>
                    
                    <div className="space-y-2 mb-3">
                        {Object.values(DifficultyLevel).map((lvl) => (
                            <div key={lvl} className="flex justify-between items-center">
                                <label className="text-xs text-gray-600 font-medium">{lvl}</label>
                                <input 
                                    type="number" 
                                    min={0}
                                    value={matrixCounts[lvl]}
                                    onChange={(e) => updateMatrixCount(lvl, Number(e.target.value))}
                                    className="w-16 p-1 text-center text-sm border border-gray-300 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="pt-2 border-t border-indigo-100 flex justify-between items-center">
                         <label className="text-xs font-bold text-indigo-800 uppercase">Số lượng mã đề</label>
                         <input 
                            type="number"
                            min={1}
                            max={5}
                            value={variantCount}
                            onChange={(e) => setVariantCount(Number(e.target.value))}
                            className="w-16 p-1 text-center text-sm font-bold border border-indigo-300 rounded bg-white"
                         />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 italic text-right">*Tối đa 5 đề một lần</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mức độ</label>
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value as DifficultyLevel)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                        >
                            {Object.values(DifficultyLevel).map((l) => (
                            <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tổng số câu</label>
                        <input
                            type="number"
                            min={1}
                            max={50}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                        />
                    </div>
                </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <FileText size={18} />}
              {isLoading ? 'Đang khởi tạo...' : 'Tạo Đề / Câu hỏi'}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
             <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 mb-4">
                Tải lên file ảnh hoặc PDF của bài làm và đáp án để chấm điểm tự động.
             </div>

             {gradeError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                   {gradeError}
                </div>
             )}

             <FileInput label="1. Tải lên bài thi (HS làm)" file={submissionFile} setFile={(f) => { setSubmissionFile(f); setGradeError(null); }} />
             <FileInput label="2. Tải lên đáp án chuẩn" file={answerKeyFile} setFile={(f) => { setAnswerKeyFile(f); setGradeError(null); }} />
             
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loại bài thi</label>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setGradingType('trac-nghiem')}
                        className={`flex-1 py-2 text-xs rounded border ${gradingType === 'trac-nghiem' ? 'bg-blue-100 border-blue-500 text-blue-700 font-bold' : 'bg-white border-gray-300'}`}
                    >
                        Trắc nghiệm
                    </button>
                    <button 
                        onClick={() => setGradingType('tu-luan')}
                        className={`flex-1 py-2 text-xs rounded border ${gradingType === 'tu-luan' ? 'bg-blue-100 border-blue-500 text-blue-700 font-bold' : 'bg-white border-gray-300'}`}
                    >
                        Tự luận
                    </button>
                </div>
             </div>

             <button
              onClick={handleGrade}
              disabled={isLoading}
              className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <CheckCircle size={18} />}
              {isLoading ? 'Đang chấm thi...' : 'Chấm Bài Tự Động'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;