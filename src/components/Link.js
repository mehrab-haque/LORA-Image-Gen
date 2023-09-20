import { Button, Grid, Paper, Typography } from "@mui/material";
import { ImagePicker } from 'react-file-picker'
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const Link = props => {

    const [base64, setBase64] = useState(null)
    const [loading,setLoading]=useState(false)
    const [link,setLink]=useState('')

    const uploadClick=async ()=>{
        if(base64===null)
            toast.error('Please select an image')
        else{
            toast('Uploading images...')
            setLoading(true)
            const imageUploadResult =await axios.post('https://ddvai.com/api/upload', {
                image: base64
            })
            toast.success('Image uploaded and link copied to clipboard.')
            setLoading(false)
            setLink(imageUploadResult.data.link)
            navigator.clipboard.writeText(imageUploadResult.data.link)
        }
    }

    return (
        <Grid container spacing={1} padding={1}>
            <Toaster/>
            <Grid item xs={0} md={3} />
            <Grid item xs={12} md={6}>
                <Paper style={{ padding: '10px' }}>
                    <Grid container spacing={1} padding={1}>
                        <Grid item xs={12} md={6}>
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
                                Browse Image
                            </Button>
                        </ImagePicker>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Grid container spacing={1}>
                                <Grid item xs={12}>
                                    <center>
                                        <Button
                                            variant="contained"
                                            color='primary'
                                            onClick={uploadClick}
                                            disabled={loading}
                                            >
                                                Upload
                                            </Button>
                                        </center>
                                </Grid>
                                {
                                    link.length>0&&<Grid item xs={12}>
                                    <Paper style={{padding:'10px'}}>
                                        <Typography variant='body'>
                                            <ContentCopyIcon onClick={()=>{
                                                navigator.clipboard.writeText(link)
                                            }} style={{
                                                cursor:'pointer',
                                                marginRight:'10px'
                                            }}/>{link}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                }
                            </Grid>
                        </Grid>
                        
                    </Grid>
                </Paper>
            </Grid>
            <Grid item xs={0} md={3} />
        </Grid>
    )
}

export default Link