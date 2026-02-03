import { memo } from 'react';
import ActionInfo from './components/ActionInfo';
import Discussion from './components/Discussion';
import InputInfo from './components/InputInfo';
import OutputInfo from './components/OutputInfo';
import TickerInfo from './components/TicketInfo';
import TicketRelation from './components/TicketRelation';
import RatingFeedback from './components/RatingFeedback';
import s from './style.less';

const RightInfoGroup = (props) => {
  const { selectedNode } = props;
  
  return (
    <div className={s['right-container']}>
      <TickerInfo {...props} />
      <TicketRelation {...props} />
      
      {/* Rating Feedback - hiển thị khi ticket finished và requester xem */}
      <RatingFeedback {...props} />
      
      {/* {selectedState && (
        <StateDetails selectedState={selectedState} record={record} />
      )} */}
      
      {selectedNode && (
        <>
          <InputInfo {...props} />
          <ActionInfo {...props} />
          <OutputInfo {...props} />
        </>
      )}
      
      <Discussion {...props} />
    </div>
  );
};

export default memo(RightInfoGroup);
