export const createClip = async (videoId, startTime, endTime, videoName, watermarkUID) => {
    const cloudflareApiKey=process.env.CLOUDFLARE_API_KEY
    const cloudflareAccountId=process.env.CLOUDFLARE_ACCOUNT_ID
    //const watermarkUID = await getSecret("CLOUDFLARE_WATERMARK_UID");

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cloudflareApiKey}`
        },
        body: JSON.stringify({
            allowedOrigins: [],
            meta: {
                "name": videoName//"ClipConNombre_Prueba1"
            },
            watermark: {
                "uid": watermarkUID , //"644fcd0089a31235bf309d6fe78bd1dd"
            },
            clippedFromVideoUID: videoId,
            creator: cloudflareAccountId,
            endTimeSeconds: endTime,
            requireSignedURLs: false,
            startTimeSeconds: startTime
        })
    };

    try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/stream/clip`, options);
        console.log("response of createclip is:", response);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Error: ${data.errors[0].message}`);
        }
        console.log("Response.data was okay from cloudflare creation clip, response.data: ",data);
        return {success:true,result:data.result};
    } catch (err) {
        console.error("ERROR IN CREATE CLIP RESPONSE",err);
        return {success:false,error:err};
    }
};

export const getVideoData=async(videoUID)=>{
    const cloudflareApiKey=process.env.CLOUDFLARE_API_KEY
    const cloudflareAccountId=process.env.CLOUDFLARE_ACCOUNT_ID

    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cloudflareApiKey}`
        }
    }
     try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/stream/${videoUID}`,options);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Error: ${data.errors[0].message}`);
        }
        console.log("FECTH GET VIDEO INFO RESPONSE",data);
        return {success:true,result:data.result};
    } catch (err) {
        console.error("ERROR IN GET VIDEO INFO",err);
        return {success:false,error:err};
    }
}

export const createDownload=async(videoUID)=>{
    const cloudflareApiKey=process.env.CLOUDFLARE_API_KEY
    const cloudflareAccountId=process.env.CLOUDFLARE_ACCOUNT_ID

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cloudflareApiKey}`
        }
    }

    try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/stream/${videoUID}/downloads`,options);
        console.log("response create download backend", response);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Error: ${data.errors[0].message}`);
        }
        console.log("FECTH CREATE DOWNLOAD INFO RESPONSE",data);
        return {success:true,result:data.result};
    } catch (err) {
        console.error("ERROR CREATE DOWNLOAD INFO",err);
        return {success:false,error:err};
    }
}

export const getDownloadInfo=async(videoUID)=>{
    const cloudflareApiKey=process.env.CLOUDFLARE_API_KEY
    const cloudflareAccountId=process.env.CLOUDFLARE_ACCOUNT_ID
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cloudflareApiKey}`
        }
    }

    try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/stream/${videoUID}/downloads`,options);
        console.log("response get download info backend", response);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Error: ${data.errors[0].message}`);
        }
        console.log("FECTH GET DOWNLOAD INFO RESPONSE",data);
        return {success:true,result:data.result};
    } catch (err) {
        console.error("ERROR GETTING DOWNLOAD INFO",err);
        return {success:false,error:err};
    }
}