import { memo, useState } from 'react';
import { connect, getLocale } from 'umi';
import { Card, Rate, Modal, notification, Button } from 'antd';
import { useIntl } from '@toolchain/hook';
import { FIELD_TYPES } from '@toolchain/shared/constants/field';
import { isEmpty, isNil } from 'lodash';
import { IconReactFA } from '@toolchain/component';
import './RatingFeedback.less';

const RatingFeedback = (props) => {
  const { dispatch, record, isRequester } = props;
  const { formatMessage } = useIntl();
  const currentLocale = getLocale();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!record) {
    return null;
  }

  // Lọc các field có updateOnFinish = true và type = RATING
  const ratingFields = record.customFields?.filter((field) => {
    return field.updateOnFinish && field.type === FIELD_TYPES.RATING;
  });

  // Không render nếu không có rating field nào
  if (!ratingFields || ratingFields.length === 0) {
    return null;
  }

  // Chỉ hiển thị khi ticket đã FINISHED và user là requester
  const isTicketFinished = record.rawStatus === 'FINISHED';
  if (!isTicketFinished || !isRequester) {
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

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Card className={isCollapsed ? 'card-info collapsed' : 'card-info'}>
      <div className="card-wrapper">
        <div className="card-header">
          <span className="headerInGeorgia">
            {formatMessage({
              id: 'tkm.myRequest.ratingFeedback',
              defaultMessage: 'Rating Feedback',
            })}
          </span>
          <Button
            icon={
              isCollapsed ? (
                <IconReactFA iconName="FaChevronDown" />
              ) : (
                <IconReactFA iconName="FaChevronUp" />
              )
            }
            onClick={toggleCollapse}
            className="header-collapse-toggle-button"
          />
        </div>

        {!isCollapsed && (
          <div className="card-body">
            {ratingFields.map((field) => {
              const { name, options = {}, message, label } = field;
              const data = record.customFieldsData || {};
              const fieldValue = data[name];
              const hasValue = !isNil(fieldValue) && fieldValue !== 0;

              // Parse message with locale support
              let messageText = message;
              try {
                messageText = JSON.parse(message)[currentLocale];
              } catch (e) {
                // Keep original message if parse fails
              }

              const maxStars = options?.max || 5;

              // Nếu đã có value, hiển thị read-only
              if (hasValue) {
                return (
                  <div key={name} className="rating-feedback-content">
                    <div className="rating-title">
                      <span className="rating-icon">⭐</span>
                      <span className="rating-text">
                        {messageText || label}
                      </span>
                    </div>

                    <div className="rating-description">
                      {formatMessage({
                        id: 'app.global.customField.ratingThankYou',
                        defaultMessage: 'Thank you for your feedback!',
                      })}
                    </div>

                    <div className="rating-stars">
                      <Rate
                        allowHalf
                        disabled
                        count={maxStars}
                        value={Number(fieldValue)}
                      />
                    </div>
                  </div>
                );
              }

              // Nếu chưa có value, hiển thị interactive rating
              return (
                <div key={name} className="rating-feedback-content">
                  <div className="rating-title">
                    <span className="rating-icon">⭐</span>
                    <span className="rating-text">{messageText || label}</span>
                  </div>

                  <div className="rating-description">
                    {formatMessage({
                      id: 'app.global.customField.ratingDescription',
                      defaultMessage:
                        'Your feedback helps us improve our ticket processing quality.',
                    })}
                  </div>

                  <div className="rating-stars">
                    <Rate
                      allowHalf
                      count={maxStars}
                      value={0}
                      onChange={(value) => handleRatingChange(name, value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

export default connect(({ User }) => ({
  currentUser: User ? User.currentUser : {},
}))(memo(RatingFeedback));
