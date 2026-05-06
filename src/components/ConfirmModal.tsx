
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './Icons';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onCancel, type = 'warning' }) => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger': return 'bg-red-500 text-white';
            case 'warning': return 'bg-yellow-500 text-black';
            case 'info': return 'bg-blue-500 text-white';
            default: return 'bg-teal-500 text-white';
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full border border-white/10"
                >
                    <div className={`p-6 ${getTypeStyles()} flex items-center gap-3`}>
                        {type === 'danger' && <Icons.RemoveCircle className="w-8 h-8" />}
                        {type === 'warning' && <Icons.Info className="w-8 h-8" />}
                        {type === 'info' && <Icons.Info className="w-8 h-8" />}
                        <h3 className="text-xl font-black uppercase italic tracking-tight">{title}</h3>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                            {message}
                        </p>
                    </div>
                    <div className="p-6 pt-0 flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold uppercase text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-3 px-4 rounded-xl font-black uppercase italic text-xs shadow-lg active:scale-95 transition-all ${getTypeStyles()}`}
                        >
                            Confirm
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmModal;
