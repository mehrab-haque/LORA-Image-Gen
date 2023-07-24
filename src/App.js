import { AppBar, Button, Grid, IconButton, LinearProgress, Paper, TextField, Toolbar, Typography } from '@mui/material'
import React, { useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const App=props=>{

  const modelRef=useRef()
  const loraRef=useRef()
  const promptRef=useRef()
  const negativePromptRef=useRef()
  const [loading,setLoading]=useState(false)
  const [image,setImage]=useState(null)

  const generateClick=async ()=>{
    const modelId=modelRef.current.value.trim()
    const loraId=loraRef.current.value.trim()
    const prompt=promptRef.current.value.trim()
    const negativePrompt=negativePromptRef.current.value.trim()

    if(modelId.length===0)
      toast.error("Model Id is empty")
    else if(loraId.length===0)
      toast.error("LORA Id is empty")
    else if(prompt.length===0)
      toast.error("prompt is empty")
    else{
      setLoading(true)
      try{
        const reqBody={
          "key": "5MqpLpSJY3vBIPyWYQKZTzSlG9TF7JeZZeclqQT8jKYt7lHjkKQLr7HwCvox",
          "model_id": modelId,
          "lora_model" : loraId,
          "prompt": prompt,
          "negative_prompt": negativePrompt,
          "width": "512",
          "height": "512",
          "samples": "1",
          "num_inference_steps": "30",
          "seed": null,
          "guidance_scale": 7.5,
          "webhook": null,
          "track_id": null
        }
        const result=await axios.post('https://stablediffusionapi.com/api/v3/dreambooth',reqBody)
        toast.success("Generated Successfully")
        setImage(result.data.output[0])
        console.log(result.data.output[0])
        setLoading(false)
      }catch(e){
        console.log(e)
        toast.error("API error occurred")
        setLoading(false)
      }
    }


  }


  //toast.error("This didn't work.")

  return(
    <div>
      <AppBar position="static">
      <Toolbar variant="dense">
        <Typography variant="h6" color="inherit" component="div">
          FPG LORA Gen
        </Typography>
      </Toolbar>
    </AppBar>
    <Grid container style={{width:'100%'}} padding={1} spacing={1}>
      <Grid item xs={12} md={6}>
        <Paper style={{padding:'10px'}}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <TextField
              fullWidth 
              defaultValue={'sd-1.5'}
                inputRef={modelRef}
                variant='outlined'
                label='Model Id'
                />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
              inputRef={loraRef}
              fullWidth
              defaultValue={'abstract-disco-diffu'}
                variant='outlined'
                label='LORA Model'
                />
            </Grid>
            <Grid item xs={12}>
              <TextField 
              fullWidth
              inputRef={promptRef}
                multiline
                defaultValue={'ultra realistic close up portrait ((beautiful pale cyberpunk female with heavy black eyeliner)), blue eyes, shaved side haircut, hyper detail, cinematic lighting, magic neon, dark red city, Canon EOS R3, nikon, f/1.4, ISO 200, 1/160s, 8K, RAW, unedited, symmetrical balance, in-frame, 8K'}
                rows={8}
                variant='outlined'
                label='Prompt'
                />
            </Grid>
            <Grid item xs={12}>
              <TextField 
              fullWidth
              inputRef={negativePromptRef}
                multiline
                rows={5}
                defaultValue={'painting, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, deformed, ugly, blurry, bad anatomy, bad proportions, extra limbs, cloned face, skinny, glitchy, double torso, extra arms, extra hands, mangled fingers, missing lips, ugly face, distorted face, extra legs, anime'}
                variant='outlined'
                label='Negative Prompt (Optional)'
                />
            </Grid>
            <Grid item xs={12}>
              <div style={{
                width:'100%'
              }}>
                <Button
                variant='contained'
                color='primary'
                disabled={loading}
                onClick={generateClick}
                  style={{float:'right'}}>
                    Generate
                  </Button>
              </div>
            </Grid>
            
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        {loading?<LinearProgress/>:''}
        <Paper style={{padding:'10px'}}>
            {
              image!==null?(
                <img src={image}
                  style={{
                    width:'100%'
                  }}/>
              ):(
                <div/>
              )
            }
        </Paper>
      </Grid>
    </Grid>
    <Toaster />
    </div>
  )
}

export default App