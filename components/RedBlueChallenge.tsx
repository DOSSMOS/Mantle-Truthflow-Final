import React, { useState } from 'react';
import { Sword, Shield, Send, X, Paperclip, ExternalLink } from 'lucide-react';
import { OnChainChallenge } from '../services/challengeService';

interface Challenge {
  id: string | number;
  type: 'red' | 'blue';
  title: string;
  evidence: string;
  timestamp: Date;
  replyToId?: string | number;
  replies?: Challenge[];
}

interface RedBlueChallengeProps {
  marketId: number;
  side: 'red' | 'blue';
  challenges: OnChainChallenge[];
  onAddChallenge: (challenge: Challenge) => void;
}

export const RedBlueChallenge: React.FC<RedBlueChallengeProps> = ({ marketId, side, challenges, onAddChallenge }) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [evidence, setEvidence] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [attachmentName, setAttachmentName] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !evidence.trim()) return;

    // If there's an attachment, append its name to evidence
    const fullEvidence = attachmentName 
      ? `${evidence}\n\n📎 Attachment: ${attachmentName}` 
      : evidence;

    const newChallenge: Challenge = {
      id: Date.now().toString(),
      type: side,
      title,
      evidence: fullEvidence,
      timestamp: new Date(),
      replyToId: replyingTo || undefined
    };

    onAddChallenge(newChallenge);
    setTitle('');
    setEvidence('');
    setAttachmentName('');
    setShowForm(false);
    setReplyingTo(null);
  };

  const handleReply = (challengeId: number) => {
    setReplyingTo(challengeId);
    setShowForm(true);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Read file content and append to evidence
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      // For text files, append content; for others, just note the filename
      if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.json') || file.name.endsWith('.sol')) {
        setEvidence(prev => prev ? `${prev}\n\n--- ${file.name} ---\n${content}` : `--- ${file.name} ---\n${content}`);
      }
      setAttachmentName(file.name);
    };
    reader.readAsText(file);
  };

  // Detail modal for expanded view
  const expandedChallenge = expandedId !== null ? challenges.find(c => c.id === expandedId) : null;

  return (
    <div className="space-y-3">
      {/* Expanded Detail Modal */}
      {expandedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setExpandedId(null)}>
          <div 
            className={`relative w-[90%] max-w-[600px] max-h-[80vh] overflow-y-auto border-2 ${expandedChallenge.type === 'red' ? 'border-red-500/60 bg-[#0a0a0a]' : 'border-blue-500/60 bg-[#0a0a0a]'} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setExpandedId(null)} className="absolute top-3 right-3 text-gray-500 hover:text-white">
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              {expandedChallenge.type === 'red' ? <Sword size={16} className="text-red-400" /> : <Shield size={16} className="text-blue-400" />}
              <span className={`text-sm font-bold ${expandedChallenge.type === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                {expandedChallenge.type === 'red' ? 'RED CHALLENGE' : 'BLUE DEFENSE'}
              </span>
            </div>

            <h3 className={`text-lg font-bold mb-2 ${expandedChallenge.type === 'red' ? 'text-red-300' : 'text-blue-300'}`}>
              {expandedChallenge.title}
            </h3>

            <div className="text-[11px] text-gray-500 font-mono mb-4">
              {expandedChallenge.author ? `${expandedChallenge.author} · ` : ''}
              {expandedChallenge.timestamp.toLocaleString('zh-CN')}
            </div>

            <div className="text-xs text-gray-300 bg-black/60 border border-gray-800 p-4 font-mono whitespace-pre-wrap leading-relaxed">
              {expandedChallenge.evidence}
            </div>

            {/* Show replies in expanded view */}
            {(() => {
              const replies = challenges.filter(r => r.replyToId === expandedChallenge.id);
              if (replies.length === 0) return null;
              return (
                <div className="mt-4 space-y-2">
                  <div className="text-[10px] text-gray-500 font-mono">REPLIES ({replies.length})</div>
                  {replies.map(r => (
                    <div key={r.id} className={`border p-3 ${r.type === 'red' ? 'border-red-500/30 bg-red-900/5' : 'border-blue-500/30 bg-blue-900/5'}`}>
                      <div className="flex items-center gap-1 mb-1">
                        {r.type === 'red' ? <Sword size={10} className="text-red-400" /> : <Shield size={10} className="text-blue-400" />}
                        <span className={`text-xs font-bold ${r.type === 'red' ? 'text-red-400' : 'text-blue-400'}`}>{r.title}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono mb-1">
                        {r.author ? `${r.author.slice(0, 6)}...${r.author.slice(-4)} · ` : ''}{r.timestamp.toLocaleString('zh-CN')}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono whitespace-pre-wrap">{r.evidence}</div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { setExpandedId(null); handleReply(expandedChallenge.id); }}
                className={`px-4 py-2 text-xs font-bold ${side === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-all`}
              >
                REPLY
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mb-2 font-mono flex justify-between">
        <span>// RED-BLUE CHALLENGE SYSTEM</span>
        <span className="text-cyan-500">{challenges.length} ACTIVE</span>
      </div>

      {/* Submit Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className={`w-full ${side === 'red' ? 'bg-red-900/20 hover:bg-red-900/30 border-red-500/50 text-red-400' : 'bg-blue-900/20 hover:bg-blue-900/30 border-blue-500/50 text-blue-400'} border px-3 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1`}
        >
          {side === 'red' ? <><Sword size={12} /> SUBMIT CHALLENGE</> : <><Shield size={12} /> SUBMIT DEFENSE</>}
        </button>
      )}

      {/* Submit Form */}
      {showForm && (
        <div className={`border ${side === 'red' ? 'border-red-500/50 bg-red-900/10' : 'border-blue-500/50 bg-blue-900/10'} p-3 space-y-2`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-xs font-bold ${side === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
              {replyingTo ? (side === 'red' ? '⚔️ REPLY TO DEFENSE' : '🛡️ REPLY TO CHALLENGE') : (side === 'red' ? '⚔️ RED CHALLENGE' : '🛡️ BLUE DEFENSE')}
            </span>
            <button onClick={() => { setShowForm(false); setReplyingTo(null); setAttachmentName(''); }} className="text-gray-500 hover:text-white text-xs">✕</button>
          </div>
          {replyingTo && (
            <div className="text-[10px] text-yellow-400 mb-2">
              ↳ Replying to: {challenges.find(c => Number(c.id) === replyingTo)?.title}
            </div>
          )}
          
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title / 标题"
            className="w-full bg-black border border-gray-700 px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
          />
          
          <textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="Evidence / PoC / 证据"
            rows={3}
            className="w-full bg-black border border-gray-700 px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none font-mono"
          />

          {/* Attachment */}
          <div className="flex items-center gap-2">
            <label className={`flex items-center gap-1 px-2 py-1 text-[10px] cursor-pointer border ${side === 'red' ? 'border-red-500/30 text-red-400 hover:bg-red-900/20' : 'border-blue-500/30 text-blue-400 hover:bg-blue-900/20'} transition-all`}>
              <Paperclip size={10} />
              ATTACH FILE
              <input
                type="file"
                onChange={handleFileAttach}
                accept=".md,.txt,.json,.sol,.js,.ts,.csv,.log"
                className="hidden"
              />
            </label>
            {attachmentName && (
              <span className="text-[10px] text-cyan-400 font-mono">📎 {attachmentName}</span>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            className={`w-full ${side === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-3 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1`}
          >
            <Send size={12} /> SUBMIT
          </button>
        </div>
      )}

      {/* Challenges List */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin">
        {challenges.length === 0 ? (
          <div className="text-center py-4 border border-dashed border-gray-800">
            <div className="text-gray-600 text-xs">No challenges yet.</div>
            <div className="text-gray-700 text-[10px] mt-1">Be the first to challenge</div>
          </div>
        ) : (
          challenges.filter(c => !c.replyToId).map((c) => {
            const replies = challenges.filter(r => r.replyToId === c.id);
            return (
              <div key={c.id} className="space-y-1">
                {/* Main Challenge */}
                <div 
                  className={`border p-2 cursor-pointer hover:brightness-125 transition-all ${c.type === 'red' ? 'border-red-500/30 bg-red-900/10' : 'border-blue-500/30 bg-blue-900/10'}`}
                  onClick={() => setExpandedId(c.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1">
                      {c.type === 'red' ? <Sword size={10} className="text-red-400" /> : <Shield size={10} className="text-blue-400" />}
                      <span className={`text-xs font-bold ${c.type === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                        {c.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {replies.length > 0 && (
                        <span className="text-[9px] text-gray-500">{replies.length} replies</span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReply(c.id); }}
                        className={`text-[10px] px-2 py-0.5 ${side === 'red' ? 'text-red-400 hover:bg-red-900/20' : 'text-blue-400 hover:bg-blue-900/20'} transition-all`}
                      >
                        REPLY
                      </button>
                      <ExternalLink size={10} className="text-gray-600" />
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono mb-1">
                    {c.author ? `${c.author.slice(0, 6)}...${c.author.slice(-4)} · ` : ''}{c.timestamp.toLocaleTimeString('zh-CN')}
                  </div>
                  <div className="text-[10px] text-gray-400 bg-black/50 p-1 font-mono">
                    {c.evidence.substring(0, 80)}{c.evidence.length > 80 ? '...' : ''}
                  </div>
                </div>

                {/* Replies (compact) */}
                {replies.length > 0 && (
                  <div className="ml-4 space-y-1 border-l-2 border-gray-700 pl-2">
                    {replies.map((r) => (
                      <div
                        key={r.id}
                        className={`border p-2 cursor-pointer hover:brightness-125 transition-all ${r.type === 'red' ? 'border-red-500/30 bg-red-900/5' : 'border-blue-500/30 bg-blue-900/5'}`}
                        onClick={() => setExpandedId(r.id)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-1">
                            {r.type === 'red' ? <Sword size={8} className="text-red-400" /> : <Shield size={8} className="text-blue-400" />}
                            <span className={`text-[10px] font-bold ${r.type === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                              ↳ {r.title}
                            </span>
                          </div>
                        </div>
                        <div className="text-[9px] text-gray-500 font-mono mb-1">
                          {r.timestamp.toLocaleTimeString('zh-CN')}
                        </div>
                        <div className="text-[9px] text-gray-400 bg-black/50 p-1 font-mono">
                          {r.evidence.substring(0, 60)}{r.evidence.length > 60 ? '...' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-2 text-[10px] text-gray-600 pt-2 border-t border-gray-800">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500"></div>
          <span>RED: {challenges.filter(c => c.type === 'red').length}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500"></div>
          <span>BLUE: {challenges.filter(c => c.type === 'blue').length}</span>
        </div>
      </div>
    </div>
  );
};
