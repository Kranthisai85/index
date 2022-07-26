import React, { Component } from 'react';
import { GetOrderDetails, GetRunnerDetails, GetCustomerDetails, GetDashboardDetails } from '../../services';
import Loader from '../../loader';
import "./index.css"
import { io } from "socket.io-client";
import { NotificationManager } from 'react-notifications';
import { API_URL } from '../../../config';



export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            totalOrderList: [],
            custList: [],
            getList: [], isloaded: false, status: null, statusList: null,
            offset: 0,
            notification: "",
            runnerList: [],
            lastMonthEarn: [],
            yesearnList: [],
            todayearnList: [],
            sevenEarnList: [],
            perPage: 10,
            orgtableData: [],
            currentPage: 0
        }
    }
    handlePageClick = (e) => {
        const selectedPage = e.selected;
        const offset = selectedPage * this.state.perPage;

        this.setState({
            currentPage: selectedPage,
            offset: offset
        }, () => {
            this.loadMoreData()
        });

    };
    ///earnings handler
    async todaysEarns() {
        let todayearn = await GetOrderDetails.getAllOrderList();
        let strs = todayearn.order
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let pdd = dd
        let yyyy = today.getFullYear();

        let todayDate = yyyy + '-' + mm + '-' + dd + `T24:22:30.000Z`;
        let previousDay = yyyy + '-' + mm + '-' + pdd + `T00:22:30.000Z`;


        let filterEarn = await strs.filter(iteam => (iteam.createdAt >= previousDay && iteam.createdAt <= todayDate))


        this.setState({ todayearnList: filterEarn })
    }
    ///yesterday earnings

    async yesterdaysEarns() {

        let todayearn = await GetOrderDetails.getAllOrderList();
        let strs = todayearn.order
        let today1 = new Date();
        let dd = String(today1.getDate()).padStart(2, '0');
        let mm1 = String(today1.getMonth() + 1).padStart(2, '0'); //January is 0!
        let pdd1 = dd - 2
        let yyyy1 = today1.getFullYear();

        let todayDate1 = yyyy1 + '-' + mm1 + '-' + dd + `T24:22:30.000Z`;
        let previousDay1 = yyyy1 + '-' + mm1 + '-' + pdd1 + 'T01:34:08.000Z';


        let filterEarn1 = await strs.filter(iteam => (iteam.createdAt >= previousDay1 && iteam.createdAt <= todayDate1))


        this.setState({ yesearnList: filterEarn1 })
    }
    //7days earnings
    async SevenDaysEarns() {

        let todayearn = await GetOrderDetails.getAllOrderList();
        let strs1 = todayearn.order
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');

        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let pdd = dd - 7

        let yyyy = today.getFullYear();

        let todayDate = yyyy + '-' + mm + '-' + dd + `T24:22:30.000Z`;
        let previousDay = yyyy + '-' + mm + '-' + pdd + `T00:22:30.000Z`;


        let filterEarn2 = await strs1.filter(iteam => iteam.createdAt >= previousDay && iteam.createdAt <= todayDate)


        this.setState({ sevenEarnList: filterEarn2 })
    }
    //last 30 days earnings
    async lastMonthEarns() {

        let todayearn = await GetOrderDetails.getAllOrderList();
        let strs1 = todayearn.order
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let pmm = mm - 1

        let yyyy = today.getFullYear();

        let todayDate = yyyy + '-' + mm + '-' + dd + `T24:22:30.000Z`;
        let previousDay = yyyy + '-' + `0${pmm}` + '-' + dd + `T00:22:30.000Z`;


        let filterEarn2 = await strs1.filter(iteam => iteam.createdAt <= todayDate && iteam.createdAt >= previousDay)


        this.setState({ lastMonthEarn: filterEarn2 })
    }


    async getRunnerList() {
        this.setState({ isloaded: false })
        let runners = await GetRunnerDetails.getAllRunnerList()

        this.setState({ runnerList: runners.data })
    }

    async getCustomer() {
        let list = await GetCustomerDetails.getAllCustomerList();
        this.setState({ custList: list.data })
    }
    loadMoreData() {
        const data = this.state.orgtableData;

        const slice = data.slice(this.state.offset, this.state.offset + this.state.perPage)
        this.setState({
            pageCount: Math.ceil(data.length / this.state.perPage),
            getList: slice
        })

    }
    async getOrderList() {
        this.setState({ isloaded: true })
        let list = await GetOrderDetails.getAllOrderList();
        this.setState({ totalOrderList: list.order })
        if (list) {
            let tdata = list.order;
            var slice = tdata.slice(this.state.offset, this.state.offset + this.state.perPage)
            this.setState({
                pageCount: Math.ceil(tdata.length / this.state.perPage),
                orgtableData: tdata,
                getList: slice,
                isloaded: false
            })
        } else {
            this.setState({ isloaded: true })
        }
    }
    async getStatusList() {
        this.setState({ isloaded: true })
        let list = await GetDashboardDetails.getAllStatusOrder();
        if (list) {
            this.setState({ statusList: list.data, isloaded: false })
        } else {
            this.setState({ isloaded: true })
        }
    }
    async handleChangeStatus(e) {
        let { value } = e.target;
        this.setState({ isloaded: true })
        let list = await GetDashboardDetails.getOrderByStatus(value);
        if (list) {
            this.setState({ getList: list.order, isloaded: false })
        }
    }
    //socket connection notification
    socketNotification() {
        const socket = io(API_URL);
        console.log(socket, "socket")
        //listening data
        socket.on("toadminpanel", (arg) => {
            if (arg) {
                const audio = new Audio('http://commondatastorage.googleapis.com/codeskulptor-demos/pyman_assets/intromusic.ogg');
                audio.play();
                localStorage.clear()
                audio.onended = function () {
                    window.location.reload()
                }
            }
            NotificationManager.success(arg, 'New Order Status');
        });


    }
    componentDidMount() {
        this.getOrderList();
        this.getStatusList();
        this.getCustomer();
        this.getRunnerList();
        this.todaysEarns();
        this.yesterdaysEarns();
        this.SevenDaysEarns();
        this.lastMonthEarns();
        this.socketNotification();
    }

    render() {
        const { isloaded, lastMonthEarn, runnerList, yesearnList, sevenEarnList, custList, todayearnList, totalOrderList, statusList } = this.state;


        return (
            <div id="layoutSidenav_content">

                <main>
                    <div className="container-fluid">
                        {
                            isloaded ? <Loader /> : ''
                        }
                        <h2 className="mt-30 page-title">Dashboard</h2>
                        <ol className="breadcrumb mb-30">
                            <li className="breadcrumb-item active">Dashboard</li>
                        </ol>
                        <div className="row">
                            <div className="col-xl-3 col-md-6">
                                <div className="dashboard-report-card purple">
                                    <div className="card-content" style={{ minHeight: '75px' }}>
                                        <span className="card-title">Order Shipping</span>
                                        {
                                            statusList ? statusList.map((row, index) => (
                                                <span className="card-count" key={index} style={row.status === "shipping" ? { display: 'block' } : { display: 'none' }}>{row.total}</span>
                                            )) : ''
                                        }
                                    </div>
                                    <div className="card-media">
                                        <i className="fab fa-rev" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="dashboard-report-card red">
                                    <div className="card-content" style={{ minHeight: '75px' }}>
                                        <span className="card-title">Order Cancel</span>
                                        {
                                            statusList ? statusList.map((row, index) => (
                                                <span className="card-count" key={index} style={row.status === "cancel" ? { display: 'block' } : { display: 'none' }}>{row.total}</span>
                                            )) : ''
                                        }
                                    </div>
                                    <div className="card-media">
                                        <i className="far fa-times-circle" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="dashboard-report-card info">
                                    <div className="card-content" style={{ minHeight: '75px' }}>
                                        <span className="card-title">Order Process</span>
                                        {
                                            statusList ? statusList.map((row, index) => (
                                                <span className="card-count" key={index} style={row.status === "processing" ? { display: 'block' } : { display: 'none' }}>{row.total}</span>
                                            )) : ''
                                        }
                                    </div>
                                    <div className="card-media">
                                        <i className="fas fa-sync-alt rpt_icon" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="dashboard-report-card success">
                                    <div className="card-content" style={{ minHeight: '75px' }}>
                                        <span className="card-title">Order Delivered</span>
                                        {
                                            statusList ? statusList.map((row, index) => (
                                                <span className="card-count" key={index} style={row.status === "delieverd" ? { display: 'block' } : { display: 'none' }}>{row.total}</span>
                                            )) : ''
                                        }
                                    </div>
                                    <div className="card-media">
                                        <i className="fas fa-money-bill rpt_icon" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* //// */}
                        <div className="row">
                            <div className="col-xl-3 col-md-6">
                                <div className="dashboard-report-card  bg-primary ">
                                    <div className="card-content">
                                        <span className="card-title">total Orders</span>
                                        {
                                            totalOrderList ?
                                                <span className="card-count" style={{ display: 'block' }}>{Object.keys(totalOrderList).length}</span>
                                                : ''
                                        }
                                    </div>
                                    <div className="card-media">
                                        <i className="fa fa-cart-arrow-down" aria-hidden="true"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="dashboard-report-card bg-dark">
                                    <div className="card-content">
                                        <span className="card-title">Total Earnings</span>
                                        {
                                            totalOrderList ?
                                                <span className="card-count" style={{ display: 'block' }}>&#8377;{totalOrderList.map(ele => ele.grandtotal).reduce((cru, alt) => { return alt + cru }, 0).toFixed(2)}</span>
                                                : ''
                                        }

                                    </div>
                                    <div className="card-media">
                                        <i className="fa fa-usd" aria-hidden="true"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="dashboard-report-card bg-warning">
                                    <div className="card-content">
                                        <span className="card-title">Total Customers</span>
                                        {
                                            custList ? <span className="card-count" style={{ display: 'block' }}>{Object.keys(custList).length}</span>
                                                : ''
                                        }
                                    </div>
                                    <div className="card-media">
                                        <i className="fa fa-users" aria-hidden="true"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="dashboard-report-card purple">
                                    <div className="card-content">
                                        <span className="card-title">Total Runners</span>
                                        {
                                            runnerList ? <span className="card-count" style={{ display: 'block' }}>{Object.keys(runnerList).length}</span>
                                                : ''
                                        }
                                    </div>
                                    <div className="card-media">
                                        <i className="fa fa-motorcycle" aria-hidden="true"></i>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className=" wraperearn mx-2 py-2">
                            <div className="row">
                                <div className=' col-sm-2 '>
                                    <div className="card-medias">
                                        <i className="fa fa-calendar cicon" aria-hidden="true"></i>
                                    </div>
                                    <div className="card-contents">
                                        <i className="fa fa-calendar card-contents" aria-hidden="true"></i>
                                    </div>
                                </div>
                                <div className="vertical col-sm-2 ">
                                    <div className='textbox'>
                                        <h4 className='titletext'>TODAY EARNINGS</h4>
                                        <h5 className='textValue'>&#8377;{todayearnList.map(ele => ele.grandtotal).reduce((al, cur) => { return al + cur }, 0).toFixed(2)}</h5>
                                    </div>
                                </div>
                                <div className="vertical col-sm-2 mx-4">
                                    <div className='textbox'>
                                        <h4 className='titletext'>YESTERDAY EARNINGS</h4>
                                        <h5 className='textValue'>&#8377;{yesearnList.map(ele => ele.grandtotal).reduce((aer, crt) => { return aer + crt }, 0).toFixed(2)}</h5>
                                    </div>
                                </div>
                                <div className="vertical col-sm-2 mx-4 ">
                                    <div className='textbox'>
                                        <h4 className='titletext'>LAST 7 DAYS EARNINGS</h4>
                                        <h5 className='textValue'>&#8377;{sevenEarnList.map(ele => ele.grandtotal).reduce((altr, curr) => { return altr + curr }, 0).toFixed(2)}</h5>
                                    </div>
                                </div>
                                <div className="vertical col-sm-2 ">
                                    <div className='textbox'>
                                        <h4 className='titletext'>LAST 30 DAYS EARNINGS</h4>
                                        <h5 className='textValue'>&#8377;{lastMonthEarn.map(ele => ele.grandtotal).reduce((crt, aty) => { return crt + aty }, 0).toFixed(2)}</h5>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                    {/* another Row */}
                </main>
                <footer className="py-4 bg-footer mt-auto">
                    <div className="container-fluid">
                        <div className="d-flex align-items-center justify-content-between small">
                            <div className="text-muted-1">© 2022 <b>Eshop Buluckart</b>. by <a >Ashutosh Singh(hashing.company)</a></div>
                            <div className="footer-links">
                                <a href="/">Privacy Policy</a>
                                <a href="/">Terms &amp; Conditions</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

        );
    }
}




























// import React, { Component } from 'react';
// import { GetOrderDetails, GetRunnerDetails, GetCustomerDetails, GetDashboardDetails } from '../../services';
// import Loader from '../../loader';
// import "./index.css"
// import { io } from "socket.io-client";
// import { NotificationManager } from 'react-notifications';

// export default class Home extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             totalOrderList: [],
//             custList: [],
//             getList: [], isloaded: false, status: null, statusList: null,
//             offset: 0,
//             runnerList: [],
//             lastMonthEarn: [],
//             yesearnList: [],
//             todayearnList: [],
//             sevenEarnList: [],
//             perPage: 10,
//             orgtableData: [],
//             currentPage: 0
//         }
//     }
//     handlePageClick = (e) => {
//         const selectedPage = e.selected;
//         const offset = selectedPage * this.state.perPage;

//         this.setState({
//             currentPage: selectedPage,
//             offset: offset
//         }, () => {
//             this.loadMoreData()
//         });

//     };
//     ///earnings handler
//     async todaysEarns() {
//         let todayearn = await GetOrderDetails.getAllOrderList();
//         let strs = todayearn.order
//         let today = new Date();
//         let dd = String(today.getDate()).padStart(2, '0');
//         let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
//         let pdd = dd
//         let yyyy = today.getFullYear();

//         let todayDate = yyyy + '-' + mm + '-' + dd + `T24:22:30.000Z`;
//         let previousDay = yyyy + '-' + mm + '-' + pdd + `T00:22:30.000Z`;


//         let filterEarn = await strs.filter(iteam => (iteam.createdAt >= previousDay && iteam.createdAt <= todayDate))


//         this.setState({ todayearnList: filterEarn })
//     }
//     ///yesterday earnings

//     async yesterdaysEarns() {

//         let todayearn = await GetOrderDetails.getAllOrderList();
//         let strs = todayearn.order
//         let today1 = new Date();
//         let dd = String(today1.getDate()).padStart(2, '0');
//         let mm1 = String(today1.getMonth() + 1).padStart(2, '0'); //January is 0!
//         let pdd1 = dd - 2
//         let yyyy1 = today1.getFullYear();

//         let todayDate1 = yyyy1 + '-' + mm1 + '-' + dd + `T24:22:30.000Z`;
//         let previousDay1 = yyyy1 + '-' + mm1 + '-' + pdd1 + 'T01:34:08.000Z';


//         let filterEarn1 = await strs.filter(iteam => (iteam.createdAt >= previousDay1 && iteam.createdAt <= todayDate1))


//         this.setState({ yesearnList: filterEarn1 })
//     }
//     //7days earnings
//     async SevenDaysEarns() {

//         let todayearn = await GetOrderDetails.getAllOrderList();
//         let strs1 = todayearn.order
//         let today = new Date();
//         let dd = String(today.getDate()).padStart(2, '0');

//         let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
//         let pdd = dd - 7

//         let yyyy = today.getFullYear();

//         let todayDate = yyyy + '-' + mm + '-' + dd + `T24:22:30.000Z`;
//         let previousDay = yyyy + '-' + mm + '-' + pdd + `T00:22:30.000Z`;


//         let filterEarn2 = await strs1.filter(iteam => iteam.createdAt >= previousDay && iteam.createdAt <= todayDate)


//         this.setState({ sevenEarnList: filterEarn2 })
//     }
//     //last 30 days earnings
//     async lastMonthEarns() {

//         let todayearn = await GetOrderDetails.getAllOrderList();
//         let strs1 = todayearn.order
//         let today = new Date();
//         let dd = String(today.getDate()).padStart(2, '0');
//         let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
//         let pmm = mm - 1

//         let yyyy = today.getFullYear();

//         let todayDate = yyyy + '-' + mm + '-' + dd + `T24:22:30.000Z`;
//         let previousDay = yyyy + '-' + `0${pmm}` + '-' + dd + `T00:22:30.000Z`;


//         let filterEarn2 = await strs1.filter(iteam => iteam.createdAt <= todayDate && iteam.createdAt >= previousDay)


//         this.setState({ lastMonthEarn: filterEarn2 })
//     }


//     async getRunnerList() {
//         this.setState({ isloaded: false })
//         let runners = await GetRunnerDetails.getAllRunnerList()

//         this.setState({ runnerList: runners.data })
//     }

//     async getCustomer() {
//         let list = await GetCustomerDetails.getAllCustomerList();
//         this.setState({ custList: list.data })
//     }
//     loadMoreData() {
//         const data = this.state.orgtableData;

//         const slice = data.slice(this.state.offset, this.state.offset + this.state.perPage)
//         this.setState({
//             pageCount: Math.ceil(data.length / this.state.perPage),
//             getList: slice
//         })

//     }
//     async getOrderList() {
//         this.setState({ isloaded: true })
//         let list = await GetOrderDetails.getAllOrderList();
//         this.setState({ totalOrderList: list.order })
//         if (list) {
//             let tdata = list.order;
//             var slice = tdata.slice(this.state.offset, this.state.offset + this.state.perPage)
//             this.setState({
//                 pageCount: Math.ceil(tdata.length / this.state.perPage),
//                 orgtableData: tdata,
//                 getList: slice,
//                 isloaded: false
//             })
//         } else {
//             this.setState({ isloaded: true })
//         }
//     }
//     async getStatusList() {
//         this.setState({ isloaded: true })
//         let list = await GetDashboardDetails.getAllStatusOrder();
//         if (list) {
//             this.setState({ statusList: list.data, isloaded: false })
//         } else {
//             this.setState({ isloaded: true })
//         }
//     }
//     async handleChangeStatus(e) {
//         let { value } = e.target;
//         this.setState({ isloaded: true })
//         let list = await GetDashboardDetails.getOrderByStatus(value);
//         if (list) {
//             this.setState({ getList: list.order, isloaded: false })
//         }
//     }
//     componentDidMount() {
//         this.getOrderList();
//         this.getStatusList();
//         this.getCustomer();
//         this.getRunnerList();
//         this.todaysEarns();
//         this.yesterdaysEarns();
//         this.SevenDaysEarns();
//         this.lastMonthEarns();
//         const socket = io("http://localhost:4000");
//         console.log(socket)
//         socket.on("toadminpanel", (arg) => {
//             NotificationManager.success(arg, 'New Order Status');
//         });

//     }

//     render() {
//         const { isloaded, lastMonthEarn, runnerList, yesearnList, sevenEarnList, custList, todayearnList, totalOrderList, statusList } = this.state;


//         return (
//             <div id="layoutSidenav_content">

//                 <main>
//                     <div className="container-fluid">
//                         {
//                             isloaded ? <Loader /> : ''
//                         }
//                         <h2 className="mt-30 page-title">Dashboard</h2>
//                         <ol className="breadcrumb mb-30">
//                             <li className="breadcrumb-item active">Dashboard</li>
//                         </ol>
//                         <div className="row">
//                             <div className="col-xl-3 col-md-6">
//                                 <div className="dashboard-report-card purple">
//                                     <div className="card-content" style={{ minHeight: '75px' }}>
//                                         <span className="card-title">Order Shipping</span>
//                                         {
//                                             statusList ? statusList.map((row, index) => (
//                                                 <span className="card-count" key={index} style={row.status === "shipping" ? { display: 'block' } : { display: 'none' }}>{row.total}</span>
//                                             )) : ''
//                                         }
//                                     </div>
//                                     <div className="card-media">
//                                         <i className="fab fa-rev" />
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="col-xl-3 col-md-6">
//                                 <div className="dashboard-report-card red">
//                                     <div className="card-content" style={{ minHeight: '75px' }}>
//                                         <span className="card-title">Order Cancel</span>
//                                         {
//                                             statusList ? statusList.map((row, index) => (
//                                                 <span className="card-count" key={index} style={row.status === "cancel" ? { display: 'block' } : { display: 'none' }}>{row.total}</span>
//                                             )) : ''
//                                         }
//                                     </div>
//                                     <div className="card-media">
//                                         <i className="far fa-times-circle" />
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="col-xl-3 col-md-6">
//                                 <div className="dashboard-report-card info">
//                                     <div className="card-content" style={{ minHeight: '75px' }}>
//                                         <span className="card-title">Order Process</span>
//                                         {
//                                             statusList ? statusList.map((row, index) => (
//                                                 <span className="card-count" key={index} style={row.status === "processing" ? { display: 'block' } : { display: 'none' }}>{row.total}</span>
//                                             )) : ''
//                                         }
//                                     </div>
//                                     <div className="card-media">
//                                         <i className="fas fa-sync-alt rpt_icon" />
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="col-xl-3 col-md-6">
//                                 <div className="dashboard-report-card success">
//                                     <div className="card-content" style={{ minHeight: '75px' }}>
//                                         <span className="card-title">Order Delivered</span>
//                                         {
//                                             statusList ? statusList.map((row, index) => (
//                                                 <span className="card-count" key={index} style={row.status === "delieverd" ? { display: 'block' } : { display: 'none' }}>{row.total}</span>
//                                             )) : ''
//                                         }
//                                     </div>
//                                     <div className="card-media">
//                                         <i className="fas fa-money-bill rpt_icon" />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                         {/* //// */}
//                         <div className="row">
//                             <div className="col-xl-3 col-md-6">
//                                 <div className="dashboard-report-card  bg-primary ">
//                                     <div className="card-content">
//                                         <span className="card-title">total Orders</span>
//                                         {
//                                             totalOrderList ?
//                                                 <span className="card-count" style={{ display: 'block' }}>{Object.keys(totalOrderList).length}</span>
//                                                 : ''
//                                         }
//                                     </div>
//                                     <div className="card-media">
//                                         <i className="fa fa-cart-arrow-down" aria-hidden="true"></i>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="col-xl-3 col-md-6">
//                                 <div className="dashboard-report-card bg-dark">
//                                     <div className="card-content">
//                                         <span className="card-title">Total Earnings</span>
//                                         {
//                                             totalOrderList ?
//                                                 <span className="card-count" style={{ display: 'block' }}>&#8377;{totalOrderList.map(ele => ele.grandtotal).reduce((cru, alt) => { return alt + cru }, 0).toFixed(2)}</span>
//                                                 : ''
//                                         }

//                                     </div>
//                                     <div className="card-media">
//                                         <i className="fa fa-usd" aria-hidden="true"></i>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="col-xl-3 col-md-6">
//                                 <div className="dashboard-report-card bg-warning">
//                                     <div className="card-content">
//                                         <span className="card-title">Total Customers</span>
//                                         {
//                                             custList ? <span className="card-count" style={{ display: 'block' }}>{Object.keys(custList).length}</span>
//                                                 : ''
//                                         }
//                                     </div>
//                                     <div className="card-media">
//                                         <i className="fa fa-users" aria-hidden="true"></i>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="col-xl-3 col-md-6">
//                                 <div className="dashboard-report-card purple">
//                                     <div className="card-content">
//                                         <span className="card-title">Total Runners</span>
//                                         {
//                                             runnerList ? <span className="card-count" style={{ display: 'block' }}>{Object.keys(runnerList).length}</span>
//                                                 : ''
//                                         }
//                                     </div>
//                                     <div className="card-media">
//                                         <i className="fa fa-motorcycle" aria-hidden="true"></i>
//                                     </div>
//                                 </div>
//                             </div>

//                         </div>

//                         <div className=" wraperearn mx-2 py-2">
//                             <div className="row">
//                                 <div className=' col-sm-2 '>
//                                     <div className="card-medias">
//                                         <i className="fa fa-calendar cicon" aria-hidden="true"></i>
//                                     </div>
//                                     <div className="card-contents">
//                                         <i className="fa fa-calendar card-contents" aria-hidden="true"></i>
//                                     </div>
//                                 </div>
//                                 <div className="vertical col-sm-2 ">
//                                     <div className='textbox'>
//                                         <h4 className='titletext'>TODAY EARNINGS</h4>
//                                         <h5 className='textValue'>&#8377;{todayearnList.map(ele => ele.grandtotal).reduce((al, cur) => { return al + cur }, 0).toFixed(2)}</h5>
//                                     </div>
//                                 </div>
//                                 <div className="vertical col-sm-2 mx-4">
//                                     <div className='textbox'>
//                                         <h4 className='titletext'>YESTERDAY EARNINGS</h4>
//                                         <h5 className='textValue'>&#8377;{yesearnList.map(ele => ele.grandtotal).reduce((aer, crt) => { return aer + crt }, 0).toFixed(2)}</h5>
//                                     </div>
//                                 </div>
//                                 <div className="vertical col-sm-2 mx-4 ">
//                                     <div className='textbox'>
//                                         <h4 className='titletext'>LAST 7 DAYS EARNINGS</h4>
//                                         <h5 className='textValue'>&#8377;{sevenEarnList.map(ele => ele.grandtotal).reduce((altr, curr) => { return altr + curr }, 0).toFixed(2)}</h5>
//                                     </div>
//                                 </div>
//                                 <div className="vertical col-sm-2 ">
//                                     <div className='textbox'>
//                                         <h4 className='titletext'>LAST 30 DAYS EARNINGS</h4>
//                                         <h5 className='textValue'>&#8377;{lastMonthEarn.map(ele => ele.grandtotal).reduce((crt, aty) => { return crt + aty }, 0).toFixed(2)}</h5>
//                                     </div>
//                                 </div>


//                             </div>
//                         </div>
//                     </div>
//                     {/* another Row */}
//                 </main>
//                 <footer className="py-4 bg-footer mt-auto">
//                     <div className="container-fluid">
//                         <div className="d-flex align-items-center justify-content-between small">
//                             <div className="text-muted-1">© 2022 <b>Eshop Buluckart</b>. by <a >Ashutosh Singh(hashing.company)</a></div>
//                             <div className="footer-links">
//                                 <a href="/">Privacy Policy</a>
//                                 <a href="/">Terms &amp; Conditions</a>
//                             </div>
//                         </div>
//                     </div>
//                 </footer>
//             </div>

//         );
//     }
// }