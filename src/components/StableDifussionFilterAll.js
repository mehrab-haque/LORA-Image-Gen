import { AppBar, Button, Grid, IconButton, LinearProgress, Paper, TextField, Toolbar, Typography } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
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

const controlNetModels=[
  // "canny",
  // "depth",
  // "hed",
  // "mlsd",
  // "normal",
  // "openpose",
  // "scribble",
  // "segmentation",
  // "aesthetic-controlnet",
  // // "inpaint",
  // "softedge",
  // "lineart",
  // "shuffle",
  // "tile",
  // "face_detector",
  "qrcode"
]

const Schedulers=[
  "DDPMScheduler",
  "DDIMScheduler",
  "PNDMScheduler",
  "LMSDiscreteScheduler",
  "EulerDiscreteScheduler",
  "EulerAncestralDiscreteScheduler",
  "DPMSolverMultistepScheduler",
  "HeunDiscreteScheduler",
  "KDPM2DiscreteScheduler",
  "DPMSolverSinglestepScheduler",
  "KDPM2AncestralDiscreteScheduler",
  "UniPCMultistepScheduler",
  "DDIMInverseScheduler",
  "DEISMultistepScheduler",
  "IPNDMScheduler",
  "KarrasVeScheduler",
  "ScoreSdeVeScheduler"
]

const StableDiffusionFilterAll = props => {

  const modelRef = useRef()
  const nRef = useRef()
  const loraRef = useRef()
  const promptRef = useRef()

  const loraStrengthRef = useRef()
  const seedRef = useRef()

  const negativePromptRef = useRef()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])

  const [base64, setBase64] = useState(null)
  const [maskBase64, setMaskBase64] = useState(null)

  const [guidanceValue, setGuidanceValue] = useState(10)
  const [conditioningScale, setConditioningScale]= useState(1.9)
  const [strengthValue, setStrengthValue] = useState(0.5)
  const [stepsValue, setStepsValue] = useState(30)

  const [results,setResults]=useState(null)

  const [models, setModels] = useState(null)

  const outputsRef=useRef()


  const strengthRef = useRef()



  const imagesRef = useRef();

  const [type, setType] = useState('img2img')
  const [type3d, setType3d] = useState('ply')

  const handleChange = e => {
    setType(e.target.value)
  }

  const handleChange3d = e => {
    setType3d(e.target.value)
  }


  const loadModels = async () => {
    try {
      toast('Loading models...')
      var res = await axios.post('https://stablediffusionapi.com/api/v4/dreambooth/model_list', {
        "key": "5MqpLpSJY3vBIPyWYQKZTzSlG9TF7JeZZeclqQT8jKYt7lHjkKQLr7HwCvox"
      })
      console.log(res)
      setModels(res.data.map(m => m.model_id))
      toast.success('Models loaded')
    } catch (err) {
      console.log(err)
      toast.error('Error loading models')
    }
  }

  useEffect(() => {
    loadModels()
  }, [])


  const oneReqDone=async (arr,i,output)=>{
    toast.success(`${arr[i].title} generated`)
    console.log(output)

    var newArr=[...outputsRef.current]

    newArr[i]['status']='fetched'
    newArr[i]['data']=output

    setResults(newArr)
    outputsRef.current=newArr

    if(i<arr.length-1)
          initializeOneReq(arr,i+1)
  }

  const tryFetchTillSucceed = (fetchId,arr,i) => {
    setTimeout(async () => {
      var reqBody = {
        "key": "5MqpLpSJY3vBIPyWYQKZTzSlG9TF7JeZZeclqQT8jKYt7lHjkKQLr7HwCvox",
        "request_id": fetchId
      }
      // toast('Trying to fetch...')
      const result = await axios.post('https://stablediffusionapi.com/api/v4/dreambooth/fetch', reqBody)
      //console.log(result.data)
      if (result.data.status === "success") {
        oneReqDone(arr,i,result.data.output)
        // imagesRef.current = result.data.output
        // imagesFetched()
        // toast.success(`${title} generated`)
      } else if (result.data.status === "processing") {
        tryFetchTillSucceed(fetchId,arr,i)
      } else {
        console.log(result)
        toast.error(`An error occurred for ${arr[i].title}`)
        if(i<arr.length-1)
          initializeOneReq(arr,i+1)
      }
    }, 5000);
  }
  

  const initializeOneReq=async (arr,i)=>{
    console.log(arr[i].body)
    const result = await axios.post('https://stablediffusionapi.com/api/v5/controlnet', arr[i].body)

      if (result.data.status === 'processing') {
        //toast("Processing...")
        tryFetchTillSucceed(result.data.id,arr,i)
      } else if (result.data.status === "success") {
        oneReqDone(arr,i,result.data.output)
        // setLoading(false)
      } else {
        console.log(result)
        toast.error(`An error occurred for ${arr[i].title}`)
        if(i<arr.length-1)
          initializeOneReq(arr,i+1)
        // setLoading(false)
      }
  }

  const generateClick = async () => {
    const modelId = modelRef.current.value.trim()
      const nSamples = parseInt(nRef.current.value.trim())
      const prompt = promptRef.current.value.trim()
      const negativePrompt = negativePromptRef.current.value.trim()
      var loraStrength = loraStrengthRef.current.value.trim()
      var seedValue = seedRef.current.value.trim()
      if (loraStrength.length === 0) loraStrength = null
      var seed = null
      var loraId = loraRef.current.value.trim()
      if (loraId.length === 0) {
        loraId = null
        loraStrength = null
      }
      try {
        var tmp = parseInt(seedValue)
        seed = tmp
      } catch (err) { }

      if (modelId.length === 0)
        toast.error("Model Id is empty")
      else if (nSamples === undefined || nSamples === NaN || nSamples === null || nSamples < 1)
        toast.error("Invalid number of samples")
      else if (prompt.length === 0)
        toast.error("prompt is empty")
      else if (base64 === null)
        toast.error('Please select the init image')
      else {

        try {
          toast('Uploading image...')
          setLoading(true)
          const imageUploadResult = await axios.post('https://ddvai.com/api/upload', {
            image: base64
          })
          toast('Image uploaded...')
          console.log(imageUploadResult)
          setLoading(false)

          var maskImageResult=null
          if(maskBase64!==null){
            var res = await axios.post('https://ddvai.com/api/upload', {
              image: maskBase64
            })
            maskImageResult=res.data.link
            toast('Mask image uploaded...')
          }

          /*
            "auto_hint": "yes",
            "guess_mode" : "no",
            "mask_image": null,
            "width": "512",
            "height": "512",
            "samples": "1",
            "scheduler": "UniPCMultistepScheduler",
            "num_inference_steps": "30",
            "safety_checker": "no",
            "enhance_prompt": "yes",
            "guidance_scale": 7.5,
            "strength": 0.55,
            "lora_model": "more_details",
            "tomesd": "yes",
            "use_karras_sigmas": "yes"
          */

          var body={
            "key": "5MqpLpSJY3vBIPyWYQKZTzSlG9TF7JeZZeclqQT8jKYt7lHjkKQLr7HwCvox",
            "controlnet_model": "canny",
            "controlnet_type" :"canny",
            "scheduler": "EulerAncestralDiscreteScheduler",
            "use_karras_sigmas": "yes",
            "model_id": modelId,
            "auto_hint": "yes",
            "guess_mode" : "no",
            "prompt": prompt,
            "negative_prompt": negativePrompt,
            "init_image": imageUploadResult.data.link,
            "mask_image": maskImageResult,
            "width": "512",
            "height": "512",
            "samples": `${nSamples}`,
            "num_inference_steps": `${stepsValue}`,
            "safety_checker": "no",
            "enhance_prompt": "yes",
            "guidance_scale": guidanceValue,
            "controlnet_conditioning_scale": conditioningScale,
            "strength": strengthValue,
            "lora_model": loraId,
            "clip_skip": "1",
            "control_image":"https://ddvai.com/api/images/d2ae6a39-e89d-4ba1-a6ab-3f411f9317471694431222367.png",
            "tomesd": "yes",
            "vae": null,
            "lora_strength": loraStrength,
            "embeddings_model": null,
            "seed": seed,
            "webhook": null,
            "track_id": null,
            "temp": "no",
          }

          var reqBodies=[]

          controlNetModels.map(cm=>{
            reqBodies.push({
              title:`controlnet model: ${cm}`,
              body:{
                ...body,
              "controlnet_model":cm,
              "controlnet_type":cm
              },
              status:'loading'
            })
          })

          // console.log(reqBodies)
          // return

          outputsRef.current=reqBodies

          setResults(reqBodies)
          initializeOneReq(reqBodies,0)
        } catch (err) {
          toast.error("image upload failed")
          setLoading(false)
        }
      }
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h6" color="inherit" component="div">
            FPG LORA Gen
          </Typography>
        </Toolbar>
      </AppBar>
      <Grid container style={{ width: '100%' }} padding={1} spacing={1}>
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: '10px' }}>
            <Grid container spacing={1}>
              {/* <Grid item xs={12}>
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
                    <FormControlLabel value="txt23d" control={<Radio />} label="Text to 3D" />
                  </RadioGroup>
                </FormControl>
              </Grid> */}
              {
                type==='txt23d'&&<Grid item xs={12}>
                  <FormControl>
                    <FormLabel id="demo-row-radio-buttons-group-label-3d">Output Type</FormLabel>
                    <RadioGroup
                      row
                      aria-labelledby="demo-row-radio-buttons-group-label-3d"
                      name="row-radio-buttons-group"
                      value={type3d}
                      onChange={handleChange3d}
                    >
                      <FormControlLabel value="gif" control={<Radio />} label="GIF" />
                      <FormControlLabel value="ply" control={<Radio />} label="PLY" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              }
              {
                type === 'txt2img' && <Grid item xs={6} md={4}>
                  {
                    models !== null ? (
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={models}
                        defaultValue={{ label: 'sd-1.5' }}
                        fullWidth
                        renderInput={(params) => <TextField inputRef={modelRef} {...params} label="Model Id" />}
                      />
                    ) :
                      <LinearProgress />
                  }
                </Grid>
              }
              {
                type === 'img2img' && <Grid item xs={6} md={4}>
                  {
                    models !== null ? (
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={models}
                        defaultValue={{ label: 'anything-v5' }}
                        fullWidth
                        renderInput={(params) => <TextField {...params} inputRef={modelRef} label="Model Id" />}
                      />
                    ) :
                      <LinearProgress />
                  }
                </Grid>
              }
              {
                (type === 'txt2img' || type === 'img2img') && <Grid item xs={6} md={4}>
                  <TextField
                    fullWidth
                    defaultValue={'4'}
                    inputRef={nRef}
                    variant='outlined'
                    label='Number of Samples'
                    type='number'
                  />
                </Grid>
              }
              {
                (type === 'txt2img' || type === 'img2img') && <Grid item xs={12} md={4}>
                  <TextField
                    inputRef={loraRef}
                    fullWidth
                    defaultValue={'abstract-disco-diffu'}
                    variant='outlined'
                    label='LORA Model'
                  />
                </Grid>
              }
              {
                type === 'img2img' && <Grid item xs={6} md={4}>
                  <Typography id="input-slider" gutterBottom>
                    Strength
                  </Typography>

                  <Slider
                    value={strengthValue}
                    onChange={e => {
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
              {
                type === 'img2img' && <Grid item xs={6} md={4}>
                  <Typography id="input-slider" gutterBottom>
                    Condioning Scale
                  </Typography>

                  <Slider
                    value={conditioningScale}
                    onChange={e => {
                      setConditioningScale(e.target.value)
                    }}
                    valueLabelDisplay="auto"
                    step={0.1}
                    marks
                    min={0.1}
                    max={5}
                  />

                </Grid>
              }
              <Grid item xs={6} md={4}>
                <Typography id="input-slider" gutterBottom>
                  Guidance Scale
                </Typography>

                <Slider
                  value={guidanceValue}
                  onChange={e => {
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
                  onChange={e => {
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
                type === 'img2img' && <Grid item xs={12} md={3}>
                  {
                    base64 !== null && <img style={{ width: '100%' }}
                      src={base64} />
                  }


                  <ImagePicker
                    extensions={['jpg', 'jpeg', 'png']}
                    dims={{ minWidth: 100, minHeight: 100 }}
                    onChange={base64 => {
                      setBase64(base64)
                    }}
                    onError={errMsg => {
                      toast.error(errMsg)
                    }}
                  >
                    <Button
                      fullWidth
                      style={{ marginTop: '10px' }}
                      variant={'outlined'}
                      startIcon={<DriveFolderUploadIcon />}
                    >
                      Update Image
                    </Button>
                  </ImagePicker>

                </Grid>
              }
              {
                type === 'img2img' && <Grid item xs={12} md={3}>
                  {
                    maskBase64 !== null && <img style={{ width: '100%' }}
                      src={maskBase64} />
                  }


                  <ImagePicker
                    extensions={['jpg', 'jpeg', 'png']}
                    dims={{ minWidth: 100, minHeight: 100 }}
                    onChange={maskBase64 => {
                      setBase64(maskBase64)
                    }}
                    onError={errMsg => {
                      toast.error(errMsg)
                    }}
                  >
                    <Button
                      fullWidth
                      style={{ marginTop: '10px' }}
                      variant={'outlined'}
                      startIcon={<DriveFolderUploadIcon />}
                    >
                      Update Mask
                    </Button>
                  </ImagePicker>

                </Grid>
              }
              {
                (type === 'txt2img' || type === 'img2img') &&
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      inputRef={loraStrengthRef}
                      variant='outlined'
                      label='LoRa Strength'
                    />
                  </Grid>
              }
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  inputRef={seedRef}
                  variant='outlined'
                  type='number'
                  label='Seed'
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
                  width: '100%'
                }}>
                  <Button
                    variant='contained'
                    color='primary'
                    disabled={loading || models === null}
                    onClick={generateClick}
                    style={{ float: 'right' }}>
                    Generate
                  </Button>
                </div>
              </Grid>

            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          {loading ? <LinearProgress /> : ''}
          <Grid container spacing={1}>
            {
              results && results.map(r=>{
                return <Grid item xs={12}>
                  <Paper style={{padding:'10px'}}>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Typography variant='h6'>
                          {r.title}
                        </Typography>
                      </Grid>
                      {
                        r.status==='loading'&& <box class="shine"></box>
                      }
                      {
                        r.status==='fetched'&&<Grid item xs={12}>
                            <Grid container spacing={1}>
                              {
                                r.data.map(o=>{
                                  return <Grid item xs={6} md={4}>
                                    <Paper>
                                      <img src={o} style={{width:'100%'}}/>
                                    </Paper>
                                  </Grid>
                                })
                              }
                            </Grid>
                        </Grid>
                      }
                    </Grid>
                  </Paper>
                </Grid>
              })
            }
            {/* {
              images.map(im => {
                return (
                  <Grid item xs={12}>
                    <Paper style={{ padding: '10px' }}>
                      {im.split('.')[im.split('.').length-1]!=='ply'&&<img src={im}
                        style={{
                          width: '100%'
                        }} />}
                      {
                        im.split('.')[im.split('.').length-1]==='ply'&&
                        <a href={im} target='_blank' style={{textDecoration:'none'}}>
                          <Button
                            color='primary'
                            variant='contained'
                            startIcon={<OpenInNewIcon/>}
                            >
                              PLY File
                          </Button>
                        </a>
                      }
                    </Paper>
                  </Grid>
                )
              })
            } */}
          </Grid>


        </Grid>
      </Grid>
      <Toaster />
    </div>
  )
}

export default StableDiffusionFilterAll
