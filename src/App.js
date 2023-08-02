import { AppBar, Button, Grid, IconButton, LinearProgress, Paper, TextField, Toolbar, Typography } from '@mui/material'
import React, { createRef, useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const App=props=>{

  const modelRef=useRef()
  const nRef=useRef()
  const loraRef=useRef()
  const promptRef=useRef()
  const negativePromptRef=useRef()
  const [loading,setLoading]=useState(false)
  const [images,setImages]=useState([])

 


    /*

      {
    "status": "processing",
    "tip": "Your image is processing in background, you can get this image using fetch API: here is link for fetch api : https://stablediffusionapi.com/docs/community-models-api-v4/dreamboothfetchqueimg",
    "eta": 20.9379869184,
    "messege": "Try to fetch request after seconds estimated",
    "webhook_status": "",
    "fetch_result": "https://stablediffusionapi.com/api/v3/dreambooth/fetch/32798037",
    "id": 32798037,
    "output": [],
    "meta": {
        "prompt": " ultra realistic close up portrait ((beautiful pale cyberpunk female with heavy black eyeliner)), blue eyes, shaved side haircut, hyper detail, cinematic lighting, magic neon, dark red city, Canon EOS R3, nikon, f/1.4, ISO 200, 1/160s, 8K, RAW, unedited, symmetrical balance, in-frame, 8K hyperrealistic, full body, detailed clothing, highly detailed, cinematic lighting, stunningly beautiful, intricate, sharp focus, f/1. 8, 85mm, (centered image composition), (professionally color graded), ((bright soft diffused light)), volumetric fog, trending on instagram, trending on tumblr, HDR 4K, 8K",
        "model_id": "sd-1.5",
        "negative_prompt": "painting, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, deformed, ugly, blurry, bad anatomy, bad proportions, extra limbs, cloned face, skinny, glitchy, double torso, extra arms, extra hands, mangled fingers, missing lips, ugly face, distorted face, extra legs, anime(child:1.5), ((((underage)))), ((((child)))), (((kid))), (((preteen))), (teen:1.5) ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, bad anatomy, watermark, signature, cut off, low contrast, underexposed, overexposed, bad art, beginner, amateur, distorted face, blurry, draft, grainy",
        "scheduler": "UniPCMultistepScheduler",
        "safety_checker": "no",
        "W": 512,
        "H": 512,
        "guidance_scale": 7.5,
        "seed": 1677778160,
        "steps": 20,
        "n_samples": 1,
        "full_url": "no",
        "tomesd": "yes",
        "upscale": "no",
        "multi_lingual": "no",
        "panorama": "no",
        "self_attention": "no",
        "use_karras_sigmas": "yes",
        "embeddings": null,
        "vae": null,
        "lora": "abstract-disco-diffu",
        "lora_strength": 1,
        "clip_skip": 1,
        "temp": "no",
        "base64": "no",
        "file_prefix": "55b72298-41b8-4528-9961-d59ab4482058.png"
    },
    "future_links": [
        "https://cdn.stablediffusionapi.com/generations/0-55b72298-41b8-4528-9961-d59ab4482058.png"
    ]
}

    */

  const imagesRef=useRef();


  const imagesFetched=()=>{
    toast.success("Generated Successfully")
    setImages(imagesRef.current)
    setLoading(false)
  }

  const imageFetchFailed=()=>{
    toast.error("Error occurred")
    setLoading(false)
  }

  const tryFetchTillSucceed=(fetchId)=>{
    setTimeout(async ()=>{ 
      var reqBody={
        "key": "5MqpLpSJY3vBIPyWYQKZTzSlG9TF7JeZZeclqQT8jKYt7lHjkKQLr7HwCvox",
        "request_id":fetchId
      }
      toast('Trying to fetch...')
      const result=await axios.post('https://stablediffusionapi.com/api/v4/dreambooth/fetch',reqBody)
      console.log(result.data)
      if(result.data.status==="success"){
        imagesRef.current=result.data.output
        imagesFetched()
      }else if(result.data.status==="processing"){
        tryFetchTillSucceed(fetchId)
      }else{
        imageFetchFailed()
      }
    }, 5000);
  }

  const generateClick=async ()=>{
    const modelId=modelRef.current.value.trim()
    const loraId=loraRef.current.value.trim()
    const nSamples=parseInt(nRef.current.value.trim())
    const prompt=promptRef.current.value.trim()
    const negativePrompt=negativePromptRef.current.value.trim()

    if(modelId.length===0)
      toast.error("Model Id is empty")
    else if(nSamples===undefined || nSamples===NaN || nSamples===null || nSamples<1)
      toast.error("Invalid number of samples")
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
          "samples": `${nSamples}`,
          "num_inference_steps": "30",
          "seed": null,
          "guidance_scale": 7.5,
          "webhook": null,
          "track_id": null,
          "enhance_prompt":'no'
        }
        const result=await axios.post('https://stablediffusionapi.com/api/v4/dreambooth',reqBody)
        
        if(result.data.status==='processing'){
          toast("Processing...")
          tryFetchTillSucceed(result.data.id)

        } else if(result.data.status==="success"){
          toast.success("Generated Successfully")
          setImages(result.data.output)
          setLoading(false)
        }  else{
          toast.error("An error occurred")
          setLoading(false)

        }
        
        
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
            <Grid item xs={6} md={4}>
              <TextField
              fullWidth 
              defaultValue={'sd-1.5'}
                inputRef={modelRef}
                variant='outlined'
                label='Model Id'
                />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                fullWidth 
                defaultValue={'4'}
                  inputRef={nRef}
                  variant='outlined'
                  label='Number of Samples'
                  type='number'
                />
            </Grid>
            <Grid item xs={12} md={4}>
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
        <Grid container spacing={1}>
        {
          images.map(im=>{
            return(
              <Grid item xs={12}>
                  <Paper style={{padding:'10px'}}>
                     <img src={im}
                        style={{
                          width:'100%'
                        }}/>
              </Paper>
              </Grid>
            )
          })
        }
        </Grid>
        
        
      </Grid>
    </Grid>
    <Toaster />
    </div>
  )
}

export default App