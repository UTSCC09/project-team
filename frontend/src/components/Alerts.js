export default class Voice extends React.PureComponent {
    constructor(props) {
        super(props)
     
        this.state = {
          show: true
        }
    }
    handleShow1 = () => {
        this.setState({
           show: true
        })
      
        setTimeout(() => {
           this.setState({
               show: false
           })
        }, 2000)
    }
}
