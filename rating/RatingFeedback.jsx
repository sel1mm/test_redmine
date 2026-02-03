import { memo } from 'react';
import { connect, getLocale } from 'umi';
import { Card, Rate, Modal, notification } from 'antd';
import { useIntl } from '@toolchain/hook';
import { FIELD_TYPES } from '@toolchain/shared/constants/field';
import { isEmpty, isNil } from 'lodash';
import './RatingFeedback.less';

const RatingFeedback = (props) => {
  const { dispatch, record, isRequester } = props;
  const { formatMessage } = useIntl();
  const currentLocale = getLocale();

  if (!record) {
    return null;
  }

  // Chỉ hiển thị khi ticket đã FINISHED
  const isTicketFinished = record.rawStatus === 'FINISHED';
  if (!isTicketFinished || !isRequester) {
    return null;
  }

  // Lọc các field có updateOnFinish = true và type = RATING
  const ratingFields = record.customFields?.filter((field) => {
    if (!field.updateOnFinish || field.type !== FIELD_TYPES.RATING) {
      return false;
    }

    const data = record.customFieldsData || {};
    const fieldValue = data[field.name];

    // Chỉ hiển thị nếu field chưa có giá trị
    return (
      isNil(fieldValue) ||
      (typeof fieldValue !== 'boolean' &&
        typeof fieldValue !== 'number' &&
        isEmpty(fieldValue))
    );
  });

  // Không render nếu không có rating field nào cần hiển thị
  if (!ratingFields || ratingFields.length === 0) {
    return null;
  }

  const handleRatingChange = async (fieldName, value) => {
    const res = await dispatch({
      type: 'ticketsV2/updateCustomField',
      payload: {
        fieldName: fieldName,
        value,
        id: record.id,
      },
    });

    if (res?.error) {
      notification.error({
        message:
          res.error.message ||
          formatMessage({
            id: 'tkm.ticket.action.error',
          }),
      });
      return;
    }

    // Show success dialog
    Modal.success({
      title: formatMessage({
        id: 'app.global.customField.ratingSuccess.title',
        defaultMessage: 'Rating submitted successfully',
      }),
      content: formatMessage({
        id: 'app.global.customField.ratingSuccess.content',
        defaultMessage: 'Thank you for your feedback.',
      }),
    });
  };

  return (
    <Card className="card-info rating-feedback-card">
      <div className="card-wrapper">
        <div className="card-body">
          {ratingFields.map((field) => {
            const { name, options = {}, message } = field;
            const data = record.customFieldsData || {};
            const fieldValue = data[name];

            // Parse message with locale support
            let messageText = message;
            try {
              messageText = JSON.parse(message)[currentLocale];
            } catch (e) {
              // Keep original message if parse fails
            }

            const maxStars = options?.max || 5;

            return (
              <div key={name} className="rating-feedback-container">
                {/* Icon + Title */}
                <div className="rating-feedback-header">
                  <span className="rating-feedback-icon">⭐</span>
                  <span className="rating-feedback-title">{messageText}</span>
                </div>

                {/* Description */}
                <div className="rating-feedback-description">
                  {formatMessage({
                    id: 'app.global.customField.ratingDescription',
                    defaultMessage:
                      'Your feedback helps us improve our ticket processing quality.',
                  })}
                </div>

                {/* Rating stars */}
                <div className="rating-feedback-stars">
                  <Rate
                    allowHalf
                    count={maxStars}
                    value={fieldValue || 0}
                    onChange={(value) => handleRatingChange(name, value)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default connect(({ User }) => ({
  currentUser: User ? User.currentUser : {},
}))(memo(RatingFeedback));
