import { AppBar, Button, Grid, IconButton, LinearProgress, Paper, TextField, Toolbar, Typography } from '@mui/material'
import { ImagePicker } from 'react-file-picker'
import Autocomplete from '@mui/material/Autocomplete';
import React, { createRef, useEffect, useRef, useState } from 'react'
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Slider from '@mui/material/Slider';


const App=props=>{

  const modelRef=useRef()
  const nRef=useRef()
  const loraRef=useRef()
  const promptRef=useRef()

  const loraStrengthRef=useRef()
  const seedRef=useRef()

  const negativePromptRef=useRef()
  const [loading,setLoading]=useState(false)
  const [images,setImages]=useState([])

  const [base64,setBase64]=useState(null)

  const [guidanceValue,setGuidanceValue]=useState(10)
  const [strengthValue,setStrengthValue]=useState(0.5)
  const [stepsValue,setStepsValue]=useState(30)

  const [models,setModels]=useState(null)


  const strengthRef=useRef()

 


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

  const [type,setType]=useState('txt2img')

  const handleChange=e=>{
    setType(e.target.value)
  }


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

  const loadModels=async ()=>{
    try{
      toast('Loading models...')
      var res=await axios.post('https://stablediffusionapi.com/api/v4/dreambooth/model_list',{
        "key": "5MqpLpSJY3vBIPyWYQKZTzSlG9TF7JeZZeclqQT8jKYt7lHjkKQLr7HwCvox"
      })
      setModels(res.data.map(m=>m.model_id))
      toast.success('Models loaded')
    }catch(err){
      toast.error('Error loading models')
    }
  }

  useEffect(()=>{
    loadModels()
  },[])

  const generateClick=async ()=>{
    if(type==='txt2img'){
      const modelId=modelRef.current.value.trim()
      const loraId=loraRef.current.value.trim()
      const nSamples=parseInt(nRef.current.value.trim())
      const prompt=promptRef.current.value.trim()
      const negativePrompt=negativePromptRef.current.value.trim()
      var loraStrength=loraStrengthRef.current.value.trim()
      var seedValue=seedRef.current.value.trim()
      if(loraStrength.length===0)loraStrength=null
      var seed=null
      try{
        var tmp=parseInt(seedValue)
        seed=tmp
      }catch(err){}
  
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
            "num_inference_steps": `${stepsValue}`,
            "seed": seed,
            "lora_strength":loraStrength,
            "guidance_scale": guidanceValue,
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
    }else{

      const modelId=modelRef.current.value.trim()
      const nSamples=parseInt(nRef.current.value.trim())
      const prompt=promptRef.current.value.trim()
      var loraId=loraRef.current.value.trim()
      if(loraId.length===0)loraId=null
      const negativePrompt=negativePromptRef.current.value.trim()
      var loraStrength=loraStrengthRef.current.value.trim()
      var seedValue=seedRef.current.value.trim()
      if(loraStrength.length===0)loraStrength=null
      var seed=null
      try{
        var tmp=parseInt(seedValue)
        seed=tmp
      }catch(err){}

      if(modelId.length===0)
        toast.error("Model Id is empty")
      else if(nSamples===undefined || nSamples===NaN || nSamples===null || nSamples<1)
        toast.error("Invalid number of samples")
      else if(prompt.length===0)
        toast.error("prompt is empty")
      else if(base64===null)
        toast.error('Please select an prompt image')
      else{

        try{
          setLoading(true)
          const imageUploadResult=await axios.post('https://ddvai.com/api/upload',{
            image:base64
          })
          toast('Image uploaded...')
          try{
            const reqBody={
              "key": "5MqpLpSJY3vBIPyWYQKZTzSlG9TF7JeZZeclqQT8jKYt7lHjkKQLr7HwCvox",
              "prompt": prompt,
              "model_id": modelId,
              "negative_prompt": negativePrompt,
              "init_image": imageUploadResult.data.link,
              "width": "512",
              "height": "512",
              "samples": `${nSamples}`,
              "num_inference_steps": `${stepsValue}`,
              "safety_checker": "yes",
              "enhance_prompt": "yes",
              "guidance_scale": guidanceValue,
              "strength": strengthValue,
              "scheduler": "UniPCMultistepScheduler",
              "seed": seed,
              "lora_model": loraId,
              "tomesd": "yes",
              "use_karras_sigmas": "yes",
              "vae": null,
              "lora_strength": loraStrength,
              "embeddings_model": null,
              "webhook": null,
              "track_id": null
            }
            console.log(reqBody)
            const result=await axios.post('https://stablediffusionapi.com/api/v4/dreambooth/img2img',reqBody)
            
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
        }catch(err){
          toast.error("image upload failed")
          setLoading(false)
        }
      }
    }



  }

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
            <Grid item xs={12}>
              <FormControl>
                <FormLabel id="demo-row-radio-buttons-group-label">Generation Type</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  value={type}
                  onChange={handleChange}
                >
                  <FormControlLabel value="txt2img" control={<Radio />} label="Text to Image" />
                  <FormControlLabel value="img2img" control={<Radio />} label="Image to Image" />
                </RadioGroup>
              </FormControl>
           </Grid>
            {
              type==='txt2img' && <Grid item xs={6} md={4}>
                {
                  models!==null?(
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      options={models}
                      defaultValue={{label:'sd-1.5'}}
                      fullWidth
                      renderInput={(params) => <TextField inputRef={modelRef} {...params} label="Model Id" />}
                    />
                  ):
                  <LinearProgress/>
                }
              </Grid>
            }
            {
              type==='img2img' && <Grid item xs={6} md={4}>
                {
                  models!==null?(
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      options={models}
                      defaultValue={{label:'anything-v5'}}
                      fullWidth
                      renderInput={(params) => <TextField {...params} inputRef={modelRef} label="Model Id" />}
                    />
                  ):
                  <LinearProgress/>
                }
              </Grid>
            }
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
             {
              type==='img2img' && <Grid item xs={6} md={4}>
                <Typography id="input-slider" gutterBottom>
                  Strength
                </Typography>
                
                <Slider
                  value={strengthValue}
                  onChange={e=>{
                    setStrengthValue(e.target.value)
                  }}  
                  valueLabelDisplay="auto"
                  step={0.1}
                  marks
                  min={0}
                  max={1}
                />
                
                </Grid>
            }
            <Grid item xs={6} md={4}>
                <Typography id="input-slider" gutterBottom>
                  Guidance Scale
                </Typography>
                
                <Slider
                  value={guidanceValue}
                  onChange={e=>{
                    setGuidanceValue(e.target.value)
                  }}  
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={1}
                  max={20}
                />
                
                </Grid>
                <Grid item xs={6} md={4}>
                <Typography id="input-slider" gutterBottom>
                  Inference Steps
                </Typography>
                
                <Slider
                  value={stepsValue}
                  onChange={e=>{
                    setStepsValue(e.target.value)
                  }}  
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={1}
                  max={50}
                />
                
                </Grid>
            {
              type==='img2img' && <Grid item xs={12} md={3}>
                       {
                          base64!==null &&   <img style={{width:'100%'}}
                        src={base64}/>
                       }
                      
                       
                        <ImagePicker
                        extensions={['jpg', 'jpeg', 'png']}
                        dims={{minWidth: 100, minHeight: 100}}
                        onChange={base64 =>{
                            setBase64(base64)
                        }}
                        onError={errMsg => {
                            toast.error(errMsg)
                        }}
                 >
                <Button
                    style={{marginTop:'10px'}}
                    variant={'outlined'}
                    startIcon={<DriveFolderUploadIcon/>}
                >
                    Update Image
                </Button>
            </ImagePicker>
                
                </Grid>
            }
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
            <Grid item xs={6} md={4}>
              <TextField 
                fullWidth
                inputRef={loraStrengthRef}
                variant='outlined'
                label='LoRa Strength'
                />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField 
                fullWidth
                inputRef={seedRef}
                variant='outlined'
                type='number'
                label='Seed'
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