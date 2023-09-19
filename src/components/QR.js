import { Button, Grid, Paper, TextField } from '@mui/material'
import html2canvas from 'html2canvas'
import React, { useState } from 'react'
import QRCode from 'react-qr-code'

const QR=props=>{

    const [title,setTitle]=useState('')
    const [link,setLink]=useState('')

    const downloadClick=async ()=>{
        var canvas=await html2canvas(document.querySelector("#capture"),{
            width: 400,
            height: 400,
            scale:1
        })
        canvas.toDataURL("image/png")
        var a = document.createElement('a');
        a.href = canvas.toDataURL("image/png");
        a.download = 'qr.png';
        a.click();
    }

    return(
        <Grid container spacing={1} padding={1}>
            <Grid item xs={6}>
                <Paper style={{padding:'10px'}}>
                    <Grid container spacing={1} padding={1}>
                        <Grid item xs={12}>
                            <TextField
                                variant='outlined'
                                value={title}
                                label='Title'
                                fullWidth
                                onChange={e=>{
                                    setTitle(e.target.value)
                                }}/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant='outlined'
                                value={link}
                                label='Link'
                                fullWidth
                                onChange={e=>{
                                    setLink(e.target.value)
                                }}/>
                        </Grid>
                        <Grid item xs={12}>
                            <center style={{width:'100%'}}>
                                <Button
                                    variant='contained'
                                    color='error'
                                    onClick={downloadClick}
                                    >
                                    Download QR
                                </Button>
                            </center>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
            <Grid item xs={6}>
          
                  <div id='capture' style={{minHeight:'400px',minWidth:'400px',maxHeight:'400px',maxWidth:'400px',height:'400px',width:'400px',padding:'10px'}}>
                    <QRCode  style={{height:'380px',width:'380px',minHeight:'380px',minWidth:'380px',maxHeight:'380px',maxWidth:'380px'}} value={`https://2m06xslkj8.execute-api.ap-southeast-2.amazonaws.com/prod/in/item/qr?title=${title.replaceAll(':','%3A').replaceAll('/','%2F').replaceAll(' ','%20')}&link=${link.replaceAll(':','%3A').replaceAll('/','%2F').replaceAll(' ','%20')}`}/>
                  </div>
             
            </Grid>

        
        </Grid>
    )
}

export default QR