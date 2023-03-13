import React, { useState, useEffect } from 'react'
import { Breadcrumb, DatePicker, Radio, Steps} from 'antd'
import { Link } from 'react-router-dom'
import HeatMap from '../../../components/Charts/Heatmap'
import StatsBar from '../../../components/StatsBar'

import useWebSocket from 'react-use-websocket'

const { RangePicker } = DatePicker;
const dayjs = require('dayjs')

const CancellationHeatMap = () => {
  // Websocket connection
  const { sendMessage, lastMessage } = useWebSocket('wss://50heid0mqj.execute-api.eu-west-1.amazonaws.com/production');

  // State variables
  //Range/Date picker State
  const [date, setDate] = useState('2020-01');

  //Radio State
  const [radioValue, setRadioValue] = useState(1);

  //Chart State
  const [chartData, setChartData] = useState([[],[]]);
  const [chartMax, setChartMax] = useState(1);

  //StatsBar State
  const [statsBarData, setStatsBarData] = useState([[],[]]);


  //Steps State
  const [current, setCurrent] = useState(0);
  const [status, setStatus] = useState('process');


  useEffect(() => {
    if (lastMessage) {
      setCurrent(2);
      try {

        const data = radioValue === 1 ? JSON.parse(lastMessage?.data).datesRates : JSON.parse(lastMessage?.data).datesCancelled
        const statsBarData = radioValue === 1 ? JSON.parse(lastMessage?.data).totalRates : JSON.parse(lastMessage?.data).totalCancelled
        if (radioValue === 1) {
          setChartMax(1)
        } else if (radioValue === 2) {
          setChartMax(100)
        }
        
        if(data.length === 0) {
            setChartData([])
            setStatsBarData([[],[]])
          } else {
            setChartData(data)
            setStatsBarData(statsBarData)
        }
     
    } catch (error) {
      setStatus('error')
    }
    }
  }, [lastMessage]);
  
  const onChangeRadio = (e) => {
    console.log('radio checked', e.target.value);
    setRadioValue(e.target.value);
    try {

      const data = e.target.value === 1 ? JSON.parse(lastMessage?.data).datesRates : JSON.parse(lastMessage?.data).datesCancelled
      const statsBarData = e.target.value === 1 ? JSON.parse(lastMessage?.data).totalRates : JSON.parse(lastMessage?.data).totalCancelled
      if (e.target.value === 1) {
        setChartMax(1)
      } else if (e.target.value === 2) {
        setChartMax(100)
      }
      
      if(data.length === 0) {
          setChartData([])
          setStatsBarData([[],[]])
        } else {
          setChartData(data)
          setStatsBarData(statsBarData)
      }
   
  } catch (error) {
    if(current === 2){
      setStatus('error')
    }
  }
  };

  const onChangeDatePicker = (date, dateString) => {
    setCurrent(0);
    setStatus('process');
    setDate(dateString)
    // console.log(date, dateString);
  }

  // Compile the date and action into a massage and send it to the backend
  const onClickSubmit = () => {
    const startDate = dayjs(date).startOf('month').format('YYYY-MM-DD') + ' T00:00:00';
    const endDate = dayjs(date).endOf('month').format('YYYY-MM-DD') + ' T23:59:59';
    console.log(startDate, endDate);
    const data = { "action": 'cancellationDaily', "startDate": startDate, "endDate": endDate }
    setCurrent(1);
    setStatus('process');
    sendMessage(JSON.stringify(data))
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
         style={{
              margin: '16px 0',
        }}
      >
            <Breadcrumb.Item>
              <Link to={'/'}>Home</Link>
            </Breadcrumb.Item>

            <Breadcrumb.Item>
            <Link to={'/cancellation'}>Cancellation</Link>
            </Breadcrumb.Item>

            <Breadcrumb.Item>
            <Link to={'/cancellationHeatMap'}>HeatMap</Link>
            </Breadcrumb.Item>

      </Breadcrumb>

      <p>Cancellation HeatMap</p>
      
      {/* Chart */}
      <HeatMap data = {chartData} range = {date} max = {chartMax} tooltip = {[0,1,2,3]}/>

      {/* StatsBar */}
      <StatsBar data = {statsBarData}/>

      {/* Date Picker */}
      <DatePicker onChange={onChangeDatePicker} picker="month" />

    {/* Buttons */}
    <button onClick={onClickSubmit}>Send Message</button> 

    {/* Radio */}
    <Radio.Group onChange={onChangeRadio} value={radioValue}>
        <Radio value={1}>Rates</Radio>
        <Radio value={2}>Numbers</Radio>
    </Radio.Group>


    {/* Steps */}
    <Steps
      current={current}
      status= {status}
      items={[
        {
          title: 'Select date',  
        },
        {
          title: 'Analyze data',  
        },
        {
          title: 'Visualize data',          
        },
      ]}
    />

    <p>startDate message: {date}</p>
    <p>Last message: {lastMessage?.data}</p>
    <p>type: {typeof(lastMessage?.data)}</p>
    <p>Last message id: </p>

      
    </div>
  )
}

export default CancellationHeatMap