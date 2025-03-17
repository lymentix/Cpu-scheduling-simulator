import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';

//Setting up processes and generating them when clicking on the button
export default function Home() 
{
  const [processes, setProcesses] = useState([]);
  const [numProcesses, setNumProcesses] = useState(5);
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);
  const chartRef = useRef(null);

  const generateProcesses = () => {
    const newProcesses = Array.from({ length: numProcesses }, (_, i) => ({
      id: i + 1,
      burstTime: Math.floor(Math.random() * 10) + 1,
      arrivalTime: Math.floor(Math.random() * 10),
    }));
    setProcesses(newProcesses);
  };

  //for the fifo algorithim
  const fifo = (processes) => {
    let currentTime = 0;
    return processes.map(p => {
      const waitingTime = Math.max(0, currentTime - p.arrivalTime);
      currentTime += p.burstTime;
      return {
        ...p,
        waitingTime,
        turnaroundTime: waitingTime + p.burstTime,
      };
    });
  };

  //for the sjf algorithim
  const sjf = (processes) => {
    let currentTime = 0;
    const sortedProcesses = [...processes].sort((a, b) => a.burstTime - b.burstTime);
    return sortedProcesses.map(p => {
      const waitingTime = Math.max(0, currentTime - p.arrivalTime);
      currentTime += p.burstTime;
      return {
        ...p,
        waitingTime,
        turnaroundTime: waitingTime + p.burstTime,
      };
    });
  };

  //for the stch algorithim
  const stcf = (processes) => {
    let currentTime = 0;
    const remainingProcesses = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
    const completedProcesses = [];

    while (remainingProcesses.length > 0) {
      const nextProcess = remainingProcesses.reduce((prev, curr) =>
        curr.remainingTime < prev.remainingTime ? curr : prev
      );
      const waitingTime = Math.max(0, currentTime - nextProcess.arrivalTime);
      currentTime += 1;
      nextProcess.remainingTime -= 1;

      if (nextProcess.remainingTime === 0) {
        completedProcesses.push({
          ...nextProcess,
          waitingTime,
          turnaroundTime: waitingTime + nextProcess.burstTime,
        });
        remainingProcesses.splice(remainingProcesses.indexOf(nextProcess), 1);
      }
    }

    return completedProcesses;
  };

  const rr = (processes, quantum) => {
    let currentTime = 0;
    const queue = [...processes];
    const completedProcesses = [];
    const remainingTimes = processes.map(p => p.burstTime);

    while (queue.length > 0) {
      const currentProcess = queue.shift();
      const executionTime = Math.min(quantum, remainingTimes[currentProcess.id - 1]);
      remainingTimes[currentProcess.id - 1] -= executionTime;
      currentTime += executionTime;

      if (remainingTimes[currentProcess.id - 1] > 0) {
        queue.push(currentProcess);
      } else {
        completedProcesses.push({
          ...currentProcess,
          waitingTime: currentTime - currentProcess.burstTime - currentProcess.arrivalTime,
          turnaroundTime: currentTime - currentProcess.arrivalTime,
        });
      }
    }

    return completedProcesses;
  };

  const mlfq = (processes) => {
    // Simplified MLFQ implementation
    return fifo(processes); // Placeholder, replace with actual MLFQ logic
  };

  const runAlgorithm = (algorithm) => {
    setRunning(true);
    setTimeout(() => {
      let result;
      switch (algorithm) {
        case 'FIFO':
          result = fifo(processes);
          break;
        case 'SJF':
          result = sjf(processes);
          break;
        case 'STCF':
          result = stcf(processes);
          break;
        case 'RR':
          result = rr(processes, timeQuantum);
          break;
        case 'MLFQ':
          result = mlfq(processes);
          break;
        default:
          result = [];
      }
      setResults(prev => ({ ...prev, [algorithm]: result }));
      setRunning(false);
    }, 2000);
  };

  //This function is to run all Algorithims
  const runAllAlgorithms = () => {
    setRunning(true);
    setTimeout(() => {
      const algorithms = ['FIFO', 'SJF', 'STCF', 'RR', 'MLFQ'];
      const allResults = {};
      algorithms.forEach(alg => {
        let result;
        switch (alg) {
          case 'FIFO':
            result = fifo(processes);
            break;
          case 'SJF':
            result = sjf(processes);
            break;
          case 'STCF':
            result = stcf(processes);
            break;
          case 'RR':
            result = rr(processes, timeQuantum);
            break;
          case 'MLFQ':
            result = mlfq(processes);
            break;
          default:
            result = [];
        }
        allResults[alg] = result;
      });
      setResults(allResults);
      setRunning(false);
    }, 2000);
  };

  //For the animation (Optional) adds colors to it when running and showing Results for the CPU algorithims
  useEffect(() => {
    if (Object.keys(results).length > 0) {
      const ctx = document.getElementById('resultsChart');
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(results),
          datasets: [{
            label: 'Average Waiting Time',
            data: Object.values(results).map(r => r.reduce((sum, p) => sum + p.waitingTime, 0) / r.length),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [results]);


  //Saving Results as PDF for the running CPU alogrithims
  const saveResultsAsPDF = () => {
    if (Object.keys(results).length === 0) {
      alert('No results to save!');
      return;
    }

    const doc = new jsPDF();
    doc.text('CPU Scheduling Results', 10, 10);
    let yOffset = 20;

    Object.entries(results).forEach(([algorithm, result]) => {
      doc.text(`${algorithm}:`, 10, yOffset);
      yOffset += 10;

      if (result.length > 0) {
        result.forEach((p) => {
          doc.text(
            `Process ${p.id}: Waiting Time ${p.waitingTime}, Turnaround Time ${p.turnaroundTime}`,
            20,
            yOffset
          );
          yOffset += 10;
        });
      } else {
        doc.text('No results for this algorithm.', 20, yOffset);
        yOffset += 10;
      }

      yOffset += 10; // Add extra space between algorithms
    });

    doc.save('results.pdf');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>CPU Scheduling Simulator</h1>
      <div>
        <label>
          Number of Processes:
          <input
            type="number"
            value={numProcesses}
            onChange={(e) => setNumProcesses(Number(e.target.value))}
            style={{ marginLeft: '10px' }}
          />
        </label>
        <label style={{ marginLeft: '20px' }}>
          Time Quantum (for RR):
          <input
            type="number"
            value={timeQuantum}
            onChange={(e) => setTimeQuantum(Number(e.target.value))}
            style={{ marginLeft: '10px' }}
          />
        </label>
        <button onClick={generateProcesses} style={{ marginLeft: '20px' }}>Generate Processes</button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => runAlgorithm('FIFO')} disabled={running}>Run FIFO</button>&nbsp;&nbsp;
        <button onClick={() => runAlgorithm('SJF')} disabled={running}>Run SJF</button>&nbsp;&nbsp;
        <button onClick={() => runAlgorithm('STCF')} disabled={running}>Run STCF</button>&nbsp;&nbsp;
        <button onClick={() => runAlgorithm('RR')} disabled={running}>Run RR</button>&nbsp;&nbsp;
        <button onClick={() => runAlgorithm('MLFQ')} disabled={running}>Run MLFQ</button>&nbsp;&nbsp;
        <button onClick={runAllAlgorithms} disabled={running}>Run All Algorithms</button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <canvas id="resultsChart" width="400" height="200"></canvas>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h2>Algorithm Results</h2>
        {Object.entries(results).map(([algorithm, result]) => (
          <div key={algorithm} style={{ marginBottom: '20px' }}>
            <h3>{algorithm}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Process ID</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Waiting Time</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Turnaround Time</th>
                </tr>
              </thead>
              <tbody>
                {result.map((p) => (
                  <tr key={p.id}>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{p.id}</td>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{p.waitingTime}</td>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{p.turnaroundTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px' }}>
        <button onClick={saveResultsAsPDF}>Save Results as PDF</button>
      </div>
      <div style={{ marginTop: '20px' }}>
        {running && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3>Running Algorithms...</h3>
            <motion.div
              animate={{ x: [0, 100, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ width: '50px', height: '50px', background: 'blue' }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}