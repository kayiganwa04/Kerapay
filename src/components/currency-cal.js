import { useState, useEffect, useCallback } from 'react';
import { useStateCallback } from 'use-state-callback';

function Converter() {
    const [drop1, setDrop1] = useState(false);
    const [drop2, setDrop2] = useState(false);

    const [shift, setShift] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const [amount1, setAmount1] = useState(0.00);
    const [amount2, setAmount2] = useState(0.00);

    const [currency1, setCurrency1] = useStateCallback('USD');
    const [currency2, setCurrency2] = useStateCallback('EUR');

    const [result, setResult] = useState('');

    const [conversion, setConversion] = useState([]);
    const [countries, SetCountries] = useState([]);

    // eslint-disable-next-line
    const CurrencyConverter = (value, type, rat2, currency1, currency2) => {
        if (isNaN(value) ){
            setMessage('Please enter a valid number');
            return;
        }
        setMessage('');

        if (currency1 === currency2) {
            setAmount1(value);
            setAmount2(value);
            setResult(`1 ${currency1} = ${value} ${currency2}`);
            return;
        }

        type === 'am1' ? setAmount1(value) : setAmount2(value);
        var r1 = conversion[currency1] ? conversion[currency1] : 1;
        var r2 = conversion[currency2] ? conversion[currency2] : rat2;


        var new_amount = (value / (type === 'am1' ? r1 : r2)) * (type === 'am1' ? r2 : r1);
        type === 'am1' ? setAmount2(new_amount) : setAmount1(new_amount);
        setResult( type === 'am1' ? 
            `1 ${currency1}  =  ${((1/r1) * r2).toFixed(4)} ${currency2}`
            :`1 ${currency2}  =  ${((1/r2) * r1).toFixed(4)} ${currency1}`);
    };

    const getCountries = useCallback(async(cur) => {
        const res = await fetch(' https://v6.exchangerate-api.com/v6/841b21e37b1c3252d9299fe1/codes', {
            method: 'GET',
        });

        const data = await res.json();
        if (res.status === 200) {
            SetCountries(data.supported_codes);
            CurrencyConverter(1, 'am1', cur, currency1, currency2);
        }
    }, [CurrencyConverter, currency1, currency2]);

    const shifter = () => {
        setShift(!shift);
        setDrop1(false);
        setDrop2(false);

        var temp = currency1.slice();
        setCurrency1(currency2);
        setCurrency2(temp);
        CurrencyConverter(1, 'am1', 1, currency1, currency2);
    };

    const getCurrency = useCallback(async() => {
        const res = await fetch('https://v6.exchangerate-api.com/v6/841b21e37b1c3252d9299fe1/latest/USD', {
            method: 'GET',
        });

        const data = await res.json();
        if (res.status === 200) {
            setConversion(data.conversion_rates);
            await getCountries(data.conversion_rates[currency2]);
        }
    }, [getCountries, currency2]);

    useEffect(() => {
        if (loading) {
            getCurrency();
            setLoading(false);
        }
    }, [getCurrency, loading]);

    return ( 
        <div className="cal-container">
            <div className="calculator">
                <div className="head">
                    <h2>Currency Converter</h2>
                </div>

                {message ? <p className='mssg'>{message}</p> : <></>}

                <div className="calbody">
                    <div className="form-cont">
                        <form>
                            <fieldset>
                                <legend>from</legend>
                                <div className="dropdown">
                                    <div id="myDropdown" className="dropdown-content" style={{display: drop1 ? "block" : "none"}}>
                                        {countries.length ? countries.map((e, i) => (
                                            <p key={i} onClick={() => {
                                                setCurrency1(e[0], (updatedState) => CurrencyConverter(1, 'am1', 1, updatedState, currency2));
                                                setDrop1(false);
                                                // CurrencyConverter(1, 'am1', 1);
                                            }}><strong>{ e[0] }</strong> - {e[1]}</p>
                                        )) : <></>}
                                    </div>
                                </div>

                                <div className="cinfo">            
                                    <div className="cname">
                                        <h3>{currency1}</h3>
                                    </div>
        
                                    <div className="cselect">
                                        <div onClick={() => {
                                            if (drop2)  {
                                                setDrop2(false);
                                                setDrop1(true);
                                            } else {
                                                setDrop1(!drop1);
                                            }
                                        }} className={drop1 ? "dropicon droped" : "dropicon"}>
                                            <i>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                                                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                                                </svg>
                                            </i>
                                        </div>

                                        
                                    </div>
                                </div>
            
                                <div className="cinput">
                                    <input type="text" name="usd" id="usd" placeholder="0.00" value={amount1} onChange={(event) => CurrencyConverter(event.target.value, "am1", 1, currency1, currency2)}/> 
                                </div>
                            </fieldset>
                        </form>
                    </div>

                    <div className="mover">
                        <div onClick={() => shifter()} className={shift ? "contm shifted" : "contm"}>
                        <i>
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-arrow-left-right" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z"/>
                            </svg>
                        </i>
                        </div>
                    </div>

                    <div className="form-cont">
                        <form>
                            <fieldset>
                                <legend>to</legend>
                                <div className="dropdown">
                                    <div id="myDropdown" className="dropdown-content" style={{display: drop2 ? "block" : "none"}}>
                                        {countries.length ? countries.map((e, i) => (
                                            <p key={i} onClick={() => {
                                                setCurrency2(e[0], (updatedState) => CurrencyConverter(1, 'am2', 1, updatedState, currency1));
                                                setDrop2(false);
                                            }}><strong>{ e[0] }</strong> - {e[1]}</p>
                                        )) : <></>}
                                    </div>
                                </div>

                                <div className="cinfo">            
                                    <div className="cname">
                                        <h3>{currency2}</h3>
                                    </div>
        
                                    <div className="cselect">
                                        <div onClick={() => {
                                            if (drop1)  {
                                                setDrop1(false);
                                                setDrop2(true);
                                            } else {
                                                setDrop2(!drop2);
                                            }
                                        }} className={drop2 ? "dropicon droped" : "dropicon"}>
                                            <i>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                                                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                                                </svg>
                                            </i>
                                        </div>

                                        
                                    </div>
                                </div>
            
                                <div className="cinput">
                                    <input type="text" name="usd" id="usd" placeholder="0.00" value={isNaN(amount2) ? 0.00 : amount2} onChange={(event) => CurrencyConverter(event.target.value, 'am2', currency1, currency2)}/> 
                                </div>
                            </fieldset>
                        </form>
                    </div>

                </div>

                <div className="result">
                    <h2>Rating values</h2>

                    <div className="result body">
                        <p>{result}</p>
                    </div>
                </div>

            </div>
        </div>
     );
}

export default Converter;