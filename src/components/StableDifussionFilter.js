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


const StableDiffusionFilter = props => {

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

  const [guidanceValue, setGuidanceValue] = useState(10)
  const [strengthValue, setStrengthValue] = useState(0.5)
  const [stepsValue, setStepsValue] = useState(30)

  const [models, setModels] = useState(null)


  const strengthRef = useRef()



  const imagesRef = useRef();

  const [type, setType] = useState('txt23d')
  const [type3d, setType3d] = useState('ply')

  const handleChange = e => {
    setType(e.target.value)
  }

  const handleChange3d = e => {
    setType3d(e.target.value)
  }


  const imagesFetched = () => {
    toast.success("Generated Successfully")
    setImages(imagesRef.current)
    setLoading(false)
  }

  const imageFetchFailed = () => {
    toast.error("Error occurred")
    setLoading(false)
  }

  const tryFetchTillSucceed = (fetchId) => {
    setTimeout(async () => {
      var reqBody = {
        "key": "5MqpLpSJY3vBIPyWYQKZTzSlG9TF7JeZZeclqQT8jKYt7lHjkKQLr7HwCvox",
        "request_id": fetchId
      }
      toast('Trying to fetch...')
      const result = await axios.post('https://stablediffusionapi.com/api/v4/dreambooth/fetch', reqBody)
      console.log(result.data)
      if (result.data.status === "success") {
        imagesRef.current = result.data.output
        imagesFetched()
      } else if (result.data.status === "processing") {
        tryFetchTillSucceed(fetchId)
      } else {
        imageFetchFailed()
      }
    }, 5000);
  }

  const loadModels = async () => {
    try {
      toast('Loading models...')
      var res = await axios.post('https://stablediffusionapi.com/api/v4/dreambooth/model_list', {
        "key": "5MqpLpSJY3vBIPyWYQKZTzSlG9TF7JeZZeclqQT8jKYt7lHjkKQLr7HwCvox"
      })
      setModels(res.data.map(m => m.model_id))
      toast.success('Models loaded')
    } catch (err) {
      toast.error('Error loading models')
    }
  }

  useEffect(() => {
    loadModels()
  }, [])

  const generateClick = async () => {
    if (type === 'txt2img') {
      const modelId = modelRef.current.value.trim()
      var loraId = loraRef.current.value.trim()
      const nSamples = parseInt(nRef.current.value.trim())
      const prompt = promptRef.current.value.trim()
      const negativePrompt = negativePromptRef.current.value.trim()
      var loraStrength = loraStrengthRef.current.value.trim()
      var seedValue = seedRef.current.value.trim()
      if (loraStrength.length === 0) loraStrength = null
      var seed = null
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
      // else if(loraId.length===0)
      //   toast.error("LORA Id is empty")
      else if (prompt.length === 0)
        toast.error("prompt is empty")
      else {
        setLoading(true)
        try {
          const reqBody = {
            "key": "5MqpLpSJY3vBIPyWYQKZTzSlG9TF7JeZZeclqQT8jKYt7lHjkKQLr7HwCvox",
            "model_id": modelId,
            "lora_model": loraId,
            "prompt": prompt,
            "negative_prompt": negativePrompt,
            "width": "512",
            "height": "512",
            "samples": `${nSamples}`,
            "num_inference_steps": `${stepsValue}`,
            "seed": seed,
            "lora_strength": loraStrength,
            "guidance_scale": guidanceValue,
            "webhook": null,
            "track_id": null,
            "enhance_prompt": 'no'
          }
          const result = await axios.post('https://stablediffusionapi.com/api/v4/dreambooth', reqBody)

          if (result.data.status === 'processing') {
            toast("Processing...")
            tryFetchTillSucceed(result.data.id)

          } else if (result.data.status === "success") {
            toast.success("Generated Successfully")
            setImages(result.data.output)
            setLoading(false)
          } else {
            toast.error("An error occurred")
            setLoading(false)

          }


        } catch (e) {
          console.log(e)
          toast.error("API error occurred")
          setLoading(false)
        }
      }
    } else if(type==='img2img') {

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
        toast.error('Please select an prompt image')
      else {

        try {
          setLoading(true)
          const imageUploadResult = await axios.post('https://ddvai.com/api/upload', {
            image: base64
          })
          toast('Image uploaded...')
          try {
            const reqBody = {
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
            const result = await axios.post('https://stablediffusionapi.com/api/v4/dreambooth/img2img', reqBody)

            if (result.data.status === 'processing') {
              toast("Processing...")
              tryFetchTillSucceed(result.data.id)

            } else if (result.data.status === "success") {
              toast.success("Generated Successfully")
              setImages(result.data.output)
              setLoading(false)
            } else {
              toast.error("An error occurred")
              setLoading(false)

            }


          } catch (e) {
            console.log(e)
            toast.error("API error occurred")
            setLoading(false)
          }
        } catch (err) {
          toast.error("image upload failed")
          setLoading(false)
        }
      }
    }else if(type==='txt23d'){
      const prompt = promptRef.current.value.trim()
      const negativePrompt = negativePromptRef.current.value.trim()
      var seedValue = seedRef.current.value.trim()
      var seed = null
      try {
        var tmp = parseInt(seedValue)
        seed = tmp
      } catch (err) { }
      if (prompt.length === 0)
        toast.error("prompt is empty")
      else {
        setLoading(true)
        try {
          /*
            {
                "key":"",
                "prompt":"beautiful man",
                "guidance_scale":20,
                "steps":64,
                "frame_size":256,
                "output_type":"gif",
                "webhook": null,
                "track_id": null
            }
          */
          const reqBody = {
            "key": "5MqpLpSJY3vBIPyWYQKZTzSlG9TF7JeZZeclqQT8jKYt7lHjkKQLr7HwCvox",
            "prompt": prompt,
            "negative_prompt": negativePrompt,
            "frame_size": "512",
            "seed": seed,
            "lora_strength": loraStrength,
            "guidance_scale": guidanceValue,
            "webhook": null,
            "track_id": null,
            "output_type":type3d,
            "steps":stepsValue
          }
          const result = await axios.post('https://stablediffusionapi.com/api/v3/txt_to_3d', reqBody)
          console.log(result.data)
          if (result.data.status === 'processing') {
            toast("Processing...")
            tryFetchTillSucceed(result.data.id)

          } else if (result.data.status === "success") {
            toast.success("Generated Successfully")
            setImages(result.data.output)
            setLoading(false)
          } else {
            toast.error("An error occurred")
            setLoading(false)

          }


        } catch (e) {
          console.log(e)
          toast.error("API error occurred")
          setLoading(false)
        }
      }
    }



  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h6" color="inherit" component="div">
            <a href='http://tappocket.com' style={{textDecoration:'none',color:'yellow'}}>Return to TapPocket</a>
          </Typography>
        </Toolbar>
      </AppBar>
      <Grid container style={{ width: '100%' }} padding={1} spacing={1}>
        <Grid item xs={12} md={8}>
          <Paper style={{ padding: '10px' }}>
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
                    <FormControlLabel value="txt23d" control={<Radio />} label="Text to 3D" />
                  </RadioGroup>
                </FormControl>
              </Grid>
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
                type === 'img2img' && <Grid item xs={12} md={4}>
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
                (type === 'txt2img' || type === 'img2img') &&
                  <Grid item xs={6} md={4}>
                    <TextField
                      fullWidth
                      inputRef={loraStrengthRef}
                      variant='outlined'
                      label='LoRa Strength'
                    />
                  </Grid>
              }
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
        <Grid item xs={12} md={4}>
          {loading ? <LinearProgress /> : ''}
          <Grid container spacing={1}>
            {
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
            }
          </Grid>


        </Grid>
      </Grid>
      <Toaster />
    </div>
  )
}

export default StableDiffusionFilter
