// src/pages/AdminQuestionBanks.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminQuestionBanks } from '../hooks/useAdminQuestionBanks';

import ConfirmModal from '../components/common/ConfirmModal';
import { Card, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function AdminQuestionBanks() {
  const { t } = useTranslation();
  const {
    newBankName,
    setNewBankName,
    message,
    banks,
    loading,
    isModalOpen,
    bankToDelete,
    questionCounts,
    handleCreateBank,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteConfirm,
  } = useAdminQuestionBanks();

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-display font-bold">
            {t('admin.banks.title')}
          </h1>
          <p className="text-neutral-300 mt-2">
            {t('admin.banks.subtitle')}
          </p>
        </div>
        <Link to="/admin">
          <Button variant="secondary">
            {t('admin.banks.backButton')}
          </Button>
        </Link>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-4 p-4 rounded ${
            message.type === 'error'
              ? 'bg-secondary'
              : 'bg-primary-dark text-white'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Create New Bank Card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <CardTitle className="mb-4">
            {t('admin.banks.createTitle')}
          </CardTitle>
          <form
            onSubmit={handleCreateBank}
            className="flex flex-col sm:flex-row gap-4 sm:items-end"
          >
            <div className="flex-1 min-w-0">
              <Label htmlFor="bankName">
                {t('admin.banks.nameLabel')}
              </Label>
              <Input
                type="text"
                id="bankName"
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                placeholder={t('admin.banks.namePlaceholder')}
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="sm:w-auto whitespace-nowrap"
            >
              {t('admin.banks.createButton')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* CSV Upload Instructions Card */}
      <Card className="mb-8 bg-neutral-800 border-primary">
        <CardContent className="p-6">
          <CardTitle className="mb-4 text-primary-light">
            {t('admin.banks.csv.title')}
          </CardTitle>
          <p className="text-neutral-300 mb-4">
            {t('admin.banks.csv.subtitle')}
          </p>
          <div className="bg-neutral-900 p-4 rounded mb-4 font-mono text-sm text-neutral-100">
            <code>
              question;answerA;answerB;answerC;answerD;correctLetter;duration
            </code>
          </div>
          <ul className="space-y-2 text-neutral-300">
            <li>
              <strong>{t('admin.banks.csv.rule1.key')}</strong>{' '}
              {t('admin.banks.csv.rule1.text')}
            </li>
            <li>
              <strong>{t('admin.banks.csv.rule2.key')}</strong>{' '}
              {t('admin.banks.csv.rule2.text')}
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Your Question Banks Card */}
      <Card>
        <CardContent className="p-6">
          <CardTitle className="mb-4">
            {t('admin.banks.yourBanks')}
          </CardTitle>

          {loading ? (
            <p>{t('admin.banks.loading')}</p>
          ) : banks.length === 0 ? (
            <p className="text-neutral-300 text-center py-4">
              {t('admin.banks.noBanks')}
            </p>
          ) : (
            <div className="space-y-4">
              {banks.map((bank) => (
                <div
                  key={bank.id}
                  className="border-b border-neutral-700 p-4 flex justify-between items-center hover:bg-neutral-800"
                >
                  <div>
                    <p className="font-bold text-lg text-neutral-100">
                      {bank.name ||
                        bank.title ||
                        t('admin.banks.untitled')}
                    </p>
                    <p className="text-sm text-neutral-300">
                      {t('admin.banks.questionsPRefix')}:{' '}
                      {questionCounts[bank.id] || 0}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {t('admin.banks.idPrefix')}: {bank.id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/admin/question-banks/${bank.id}`}>
                      <Button variant="primary">
                        {t('admin.banks.editButton')}
                      </Button>
                    </Link>
                    <Button
                      onClick={() => openDeleteModal(bank)}
                      variant="danger"
                    >
                      {t('admin.banks.deleteButton')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title={t('admin.banks.modal.title')}
        message={
          bankToDelete
            ? t('admin.banks.modal.message', {
                name: bankToDelete.name || t('admin.banks.untitled'),
                count: questionCounts[bankToDelete.id] || 0,
              })
            : ''
        }
        confirmText={t('admin.banks.modal.confirmText')}
        confirmVariant="danger"
      />
    </div>
  );
}