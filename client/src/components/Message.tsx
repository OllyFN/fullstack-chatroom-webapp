import { messageProps } from '../../types'
import './styles/MessageStyles.css'
// Very simple message component which displays the name and message.
export default function Message({messageData}:messageProps) {
  return(
    <div className='message-wrapper'>
      <div className='username'>
        {messageData.name}
      </div> 
      <div className='message'>
        {messageData.message}
      </div>
    </div>
  )
}